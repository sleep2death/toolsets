import crypto from "crypto";

import express from "express";
import assert from "node:assert";

import bcrypt from "bcrypt";
import expressjwt from "express-jwt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { createClient } from "redis";

dotenv.config();

const rds = createClient();
rds.on("error", (err) => console.error("Redis Client Error", err));

await rds.connect();
let res = await rds.ping();
assert.equal(res, "PONG", "redis ping failed");

const app = express();
const port = 3000;

// use pug.js as template engine
app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.json());

function errorHandler(err, _, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render("error", { error: err });
}
app.use(errorHandler);

// handlers
app.get("/", (_, res) => {
  res.render("index", { title: "Hey", message: "Hello, there" });
});

app.post("/ws/signup", getSignupHandler(rds));
app.post("/ws/login", getLoginHandler(rds));

app.listen(port, () => {
  console.log(`user app listening on port ${port}`);
});

const saltRounds = 10;

function getSignupHandler(rdb) {
  const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return async (req, res) => {
    if (!req.body.email || !req.body.email.match(emailReg)) {
      return res.status(400).send({ ok: false, msg: "email invalid" });
    }

    if (
      !req.body.password ||
      req.body.password.length < 6 ||
      req.body.password !== req.body["re-password"]
    ) {
      return res.status(400).send({ ok: false, msg: "password invalid" });
    }

    // check if email exists
    const email_exists = await rdb.exists(`email:${req.body.email}`);
    if (email_exists) {
      return res.status(409).send({ ok: false, msg: "email already exists" });
    }

    // create user uuid
    const uuid = crypto.randomUUID();
    const password = await bcrypt.hash(req.body.password, saltRounds);

    let createRes = await rdb
      .multi()
      .set(`email:${req.body.email}`, uuid)
      .hSet(`uuid:${uuid}`, "password", password)
      .hSet(`uuid:${uuid}`, "email", req.body.email)
      .hSet(`uuid:${uuid}`, "nickname", req.body.nickname)
      .exec();
    assert.deepEqual(createRes, ["OK", 1, 1, 1]);
    res.send({ ok: true });
  };
}

function getLoginHandler(rdb) {
  const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return async (req, res) => {
    if (!req.body.email || !req.body.email.match(emailReg)) {
      return res.status(400).send({ ok: false, msg: "email invalid" });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).send({ ok: false, msg: "password invalid" });
    }

    // get uuid by email
    const uuid = await rdb.get(`email:${req.body.email}`);
    if (!uuid) {
      return res.status(404).send({ ok: false, msg: "email not exist" });
    }

    const user = await rdb.hGetAll(`uuid:${uuid}`);
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(401).send({ ok: false, msg: "password not match" });
    }

    // sign token for user
    const token = jwt.sign({ uuid: uuid }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1800s",
    });

    res.status(200).render("banner_normal", { token: token });
  };
}
