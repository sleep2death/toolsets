import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/big-smile";

import { checkJWT } from "./auth.js";

export default function avatars(app, rds) {
  app.post("/api/avatar/seed", checkJWT, async (req, res) => {
    if (!req.body.seed) {
      return res
        .status(400)
        .send({ ok: false, msg: "Requires seed for avatar" });
    }
    let svg = createAvatar(style, {
      seed: req.body.seed,
      // ... and other options
    });
    res.send({ ok: true, svg });
  });

  app.post("/api/avatar/save", checkJWT, async (req, res) => {
    if (!req.body.seed) {
      return res
        .status(400)
        .send({ ok: false, msg: "Requires seed for avatar" });
    }
    let svg = createAvatar(style, {
      seed: req.body.seed,
      // ... and other options
    });
    await rds.hSet(`uuid:${req.jwt.uuid}`, "avatar_seed", req.body.seed);
    res.send({ ok: true, svg });
  });
}
