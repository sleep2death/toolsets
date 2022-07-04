import crypto from "crypto";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// email regex: https://emailregex.com
const EMAIL_REG =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter,
// one special character, no space, and it must be 8-16 characters long.
const PASSWORD_REG =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

// Nickname
const NICKNAME_REG = /^[A-Za-z][A-Za-z0-9_-]{4,12}$/;

// Nickname
const SEED_REG = /^[A-Za-z0-9][A-Za-z0-9_-]{4,24}$/;

// used for random salt
const saltRounds = 10;

// format check functions
export function checkEmailFormat(mail) {
  if (mail && mail.match(EMAIL_REG)) return true;
  return false;
}

export function checkPasswordFormat(pwd) {
  if (pwd && pwd.match(PASSWORD_REG)) return true;
  return false;
}

export function checkNicknameFormat(nickname) {
  if (nickname && nickname.match(NICKNAME_REG)) return true;
  return false;
}

export function checkSeedFormat(seed) {
  if (seed && seed.match(SEED_REG)) return true;
  return false;
}

// Auth Handlers
export function auth(app, rds) {
  app.get("/login", (_, res) => {
    res.render("login", {
      title: "Login",
      desc: " Login page of the toolset",
      author: "aspirin2d@outlook.com",
    });
  });

  app.post("/login", async (req, res) => {
    try {
      // check username and password
      if (!checkEmailFormat(req.body.email)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "email format invalid" });
      }
      if (!checkPasswordFormat(req.body.pwd)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "password format invalid" });
      }
      // get uuid by email
      const uuid = await rds.get(`email:${req.body.email}`);
      if (!uuid) {
        res.status(401);
        return res.send({ title: "Oops:", msg: "email or password not match" });
      }

      const user = await rds.hGetAll(`uuid:${uuid}`);
      const match = await bcrypt.compare(req.body.pwd, user.pwd);
      if (!match) {
        res.status(401);
        return res.send({ title: "Oops:", msg: "email or password not match" });
      }

      // generate jwt token from user
      const token = jwt.sign({ uuid: uuid }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.send({ jwt: token });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  // Signup Handlers
  app.get("/signup", (_, res) => {
    res.render("signup", {
      title: "Signup",
    });
  });

  app.post("/signup", async (req, res) => {
    try {
      // check username and password
      if (!checkEmailFormat(req.body.email)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "email format invalid" });
      }
      if (!checkPasswordFormat(req.body.pwd)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "password format invalid" });
      }
      if (!checkNicknameFormat(req.body.nickname)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "nickname format invalid" });
      } else if (req.body.nickname.toLowerCase() === "admin") {
        res.status(400);
        return res.send({ title: "Oops:", msg: "nickname can't be 'admin'" });
      }

      // check if email exists
      const exists = await rds.exists(`email:${req.body.email}`);
      if (exists) {
        res.status(403);
        return res.send({ title: "Oops:", msg: "email is already taken" });
      }
      // create user uuid
      const uuid = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(req.body.pwd, saltRounds);

      await rds
        .multi()
        .set(`email:${req.body.email}`, uuid)
        .hSet(`uuid:${uuid}`, "pwd", hashedPassword)
        .hSet(`uuid:${uuid}`, "email", req.body.email)
        .hSet(`uuid:${uuid}`, "nickname", req.body.nickname)
        .hSet(`uuid:${uuid}`, "role", "member")
        .hSet(`uuid:${uuid}`, "active", "false")
        .exec();
      res.send({ ok: true });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
  app.post("/api/password/update", checkJWT, async (req, res) => {
    // Check formats
    if (!checkPasswordFormat(req.body.oldPwd)) {
      res.status(400);
      return res.send({ msg: "old password format invalid" });
    }

    if (!checkPasswordFormat(req.body.newPwd)) {
      res.status(400);
      return res.send({ msg: "new password format invalid" });
    }

    if (req.body.newPwd !== req.body.rePwd) {
      res.status(400);
      return res.send({ msg: "confrim password invalid" });
    }

    try {
      const pwd = await rds.hGet(`uuid:${req.jwt.uuid}`, "pwd");
      const match = await bcrypt.compare(req.body.oldPwd, pwd);
      if (!match) {
        res.status(401);
        return res.send({ msg: "old password not match" });
      }
      const hashedPassword = await bcrypt.hash(req.body.newPwd, saltRounds);
      await rds.HSET(`uuid:${req.jwt.uuid}`, "pwd", hashedPassword);

      res.send({ ok: true });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  });
}

export function checkJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, jwt) => {
    if (err) return res.sendStatus(403);
    req.jwt = jwt;
    next();
  });
}

export function getUserInfo(rds) {
  return async (req, res, next) => {
    try {
      const user = await rds.hGetAll(`uuid:${req.jwt.uuid}`);
      if (!user) {
        return res.sendStatus(401);
      }
      // remove user's password field
      delete user.pwd;

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };
}
