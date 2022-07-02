import { checkJWT } from "./auth.js";

export default function home(app, rds) {
  app.get("/", (_, res) => {
    res.render("redirect", { title: "Loading" });
  });

  app.post("/", checkJWT, (req, res) => {
    res.render("home");
  });
}
