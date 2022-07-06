import {
  checkJWT,
  getUserInfo,
  checkEmailFormat,
  checkNicknameFormat,
  checkSeedFormat,
} from "./auth.js";

export default function profile(app, rds) {
  app.get("/profile", (_, res) => {
    res.render("redirect", { title: "Loading" });
  });

  app.post("/profile", checkJWT, getUserInfo(rds), (req, res) => {
    res.render("profile", { title: "Profile", user: req.user });
  });

  app.post("/api/profile/save", checkJWT, async (req, res) => {
    try {
      // Check formats
      if (!checkEmailFormat(req.body.email)) {
        res.status(400);
        return res.send({ msg: "email format invalid" });
      }

      if (!checkNicknameFormat(req.body.nickname)) {
        res.status(400);
        return res.send({ msg: "nickname format invalid" });
      } else if (req.body.nickname.toLowerCase() === "admin") {
        res.status(400);
        return res.send({ msg: "nickname can't be 'admin'" });
      }

      if (!checkSeedFormat(req.body.seed)) {
        res.status(400);
        return res.send({ msg: "avatar seed format invalid" });
      }

      let uuid = req.jwt.uuid;

      const role = await rds.HGET(`uuid:${req.jwt.uuid}`, "role");
      if (role === "admin" && req.body.target) {
        uuid = await rds.GET(`email:${req.body.target}`);
      }

      // Update user email
      const oEmail = await rds.HGET(`uuid:${uuid}`, "email");
      if (oEmail !== req.body.email) {
        const exists = await rds.exists(`email:${req.body.email}`);
        if (exists) {
          res.status(403);
          return res.send({ msg: "email has been taken already" });
        }

        await rds
          .multi()
          .SET(`email:${req.body.email}`, uuid) // set new email for this uuid
          .DEL(`email:${oEmail}`) // delete old one
          .HSET(`uuid:${uuid}`, "email", req.body.email) // set email in hashmap
          .exec();
      }

      await rds
        .multi()
        .HSET(`uuid:${uuid}`, "nickname", req.body.nickname)
        .HSET(`uuid:${uuid}`, "avatar_seed", req.body.seed)
        .exec();

      res.send({ ok: true });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
}
