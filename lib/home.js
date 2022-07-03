import { checkJWT, getUserInfo } from "./auth.js";

export default function home(app, rds) {
  app.get("/", (_, res) => {
    res.render("redirect", { title: "Loading" });
  });

  app.post("/", checkJWT, getUserInfo(rds), (req, res) => {
    res.render("home", { user: req.user });
  });
}
