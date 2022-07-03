import { checkJWT, getUserInfo } from "./auth.js";

export default function profile(app, rds) {
  app.get("/profile", (_, res) => {
    res.render("redirect", { title: "Loading" });
  });

  app.post("/profile", checkJWT, getUserInfo(rds), (req, res) => {
    res.render("profile", { user: req.user });
  });
}
