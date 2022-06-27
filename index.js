import express from "express";
import morgan from "morgan";
import jwt from "jsonwebtoken";

import assert from "node:assert";
import dotenv from "dotenv";

import { createClient } from "redis";

import { getSignupHandler, getLoginHandler } from "./lib/auth.js";

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

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("common"));
}
// parse json form
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, uuid) => {
    if (err) return res.sendStatus(403);
    req.uuid = uuid;
    next();
  });
}

// home page
app.get("/", (req, res) => {
  if (req.query.token) {
    res.render("index", { token: req.query.token });
  } else {
    res.render("index");
  }
});

app.get("/index-auth", auth, (_, res) => {
  res.render("index-auth");
});

// handlers
app.get("/signup", (_, res) => {
  res.render("signup");
});

// handlers
app.get("/login", (_, res) => {
  res.render("login");
});

// auth handlers
app.post("/signup", getSignupHandler(rds));
app.post("/login", getLoginHandler(rds));

app.listen(port, () => {
  console.log(`user app listening on port ${port}`);
});
