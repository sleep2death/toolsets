import express from "express";
import morgan from "morgan";
import jwt from "jsonwebtoken";

import assert from "node:assert";
import dotenv from "dotenv";

import { createClient } from "redis";

import { ensureAdmin, getSignupHandler, getLoginHandler } from "./lib/auth.js";
import { getUserInfoHandler } from "./lib/users.js";
import { isAdmin, getAllUsers } from "./lib/admin.js";

dotenv.config();

const rds = createClient();
rds.on("error", (err) => console.error("Redis Client Error", err));

await rds.connect();
let res = await rds.ping();
assert.equal(res, "PONG", "redis ping failed");

await ensureAdmin(rds);

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

  jwt.verify(token, process.env.JWT_SECRET, (err, jwt) => {
    if (err) return res.sendStatus(403);
    req.jwt = jwt;
    next();
  });
}

// home page
app.get("/", (_, res) => {
  res.render("redirect");
});

app.post("/", auth, getUserInfoHandler(rds), (req, res) => {
  // delete password from user-info
  res.render("index", { user: req.user });
});

// admin page
app.get("/admin", (_, res) => {
  res.redirect("/admin/users");
});

// manage users
app.get("/admin/users", (_, res) => {
  res.render("redirect");
});

app.post(
  "/admin/users",
  auth,
  getUserInfoHandler(rds),
  isAdmin,
  getAllUsers(rds),
  (req, res) => {
    res.render("admin-users", { user: req.user, users: req.users });
  }
);

app.post(
  "/api/user-active",
  auth,
  getUserInfoHandler(rds),
  isAdmin,
  async (req, res) => {
    const uuid = await rds.GET(`email:${req.body.email}`);
    if (!uuid) {
      return res.sendStatus(400);
    }

    console.log(req.body.active, uuid);
    await rds.HSET(`uuid:${uuid}`, "active", req.body.active);
    // res.render("admin-users", { user: req.user, users: req.users });
    res.send("ok");
  }
);

// 404 handler
app.get("/error", (req, res) => {
  res.render("error", { status: req.query.code ? req.query.code : 0 });
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
