import express from "express";
import { createClient } from "redis";
import morgan from "morgan";
import dotenv from "dotenv";
import assert from "node:assert/strict";

import { login } from "./lib/auth.js";
import home from "./lib/home.js";
import avatars from "./lib/avatars.js";

// load .env file
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
app.use(express.static("public"));

app.get("/api/ping", (_, res) => {
  res.send("pong");
});

login(app, rds);
home(app, rds);
avatars(app, rds);

app.listen(port, () => {
  console.log(`user app listening on port ${port}`);
});
