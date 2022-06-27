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

// used for random salt
const saltRounds = 10;

function checkEmail(mail) {
  if (mail && mail.match(EMAIL_REG)) return true;
  return false;
}

function checkPassword(pwd) {
  if (pwd && pwd.match(PASSWORD_REG)) return true;
  return false;
}

function checkNickname(nickname) {
  if (nickname && nickname.match(NICKNAME_REG)) return true;
  return false;
}

export function getSignupHandler(rdb) {
  return async (req, res) => {
    try {
      // check username and password
      if (!checkEmail(req.body.email)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "email format invalid" });
      }
      if (!checkPassword(req.body.password)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "password format invalid" });
      }
      if (!checkNickname(req.body.nickname)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "nickname format invalid" });
      }

      // check if email exists
      const exists = await rdb.exists(`email:${req.body.email}`);
      if (exists) {
        res.status(403);
        return res.send({ title: "Oops:", msg: "email is already taken" });
      }
      // create user uuid
      const uuid = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      await rdb
        .multi()
        .set(`email:${req.body.email}`, uuid)
        .hSet(`uuid:${uuid}`, "pwd", hashedPassword)
        .hSet(`uuid:${uuid}`, "email", req.body.email)
        .hSet(`uuid:${uuid}`, "nickname", req.body.nickname)
        .exec();
      res.send({ ok: true });
    } catch (err) {
      console.error(err.stack);
      return res.send({ title: "Oops:", msg: "something wrong..." });
    }
  };
}

export function getLoginHandler(rdb) {
  return async (req, res) => {
    try {
      // check username and password
      if (!checkEmail(req.body.email)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "email format invalid" });
      }
      if (!checkPassword(req.body.password)) {
        res.status(400);
        return res.send({ title: "Oops:", msg: "password format invalid" });
      }
      // get uuid by email
      const uuid = await rdb.get(`email:${req.body.email}`);
      if (!uuid) {
        res.status(401);
        return res.send({ title: "Oops:", msg: "email or password not match" });
      }

      const user = await rdb.hGetAll(`uuid:${uuid}`);
      const match = await bcrypt.compare(req.body.password, user.pwd);
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
      res.status(500);
      return res.send({ title: "Oops:", msg: "something wrong..." });
    }
  };
}
