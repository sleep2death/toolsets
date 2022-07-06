import { checkJWT, getUserInfo } from "./auth.js";

const USERS_PER_PAGE = 30;

export default function admin(app, rds) {
  app.get("/admin/users", (_, res) => {
    res.render("redirect", { title: "Loading" });
  });

  app.post(
    "/admin/users",
    checkJWT,
    getUserInfo(rds),
    isAdmin(rds),
    async (req, res) => {
      try {
        let cursor = 0;
        if (req.body.cursor) {
          cursor = req.body.cursor;
        }
        const result = await rds.scan(cursor, {
          MATCH: "uuid:*",
          COUNT: USERS_PER_PAGE,
        });

        let users = [];
        if (result.keys.length > 0) {
          const multi = rds.multi();
          result.keys.forEach((key) => {
            multi.hGetAll(key);
          });
          users = await multi.exec();
          users.forEach((user) => {
            delete user.pwd;
          });
          cursor = result.cursor;
        }
        //TODO: user pagenation needed here
        res.render("admin-users", { user: req.user, users: users, cursor });
      } catch (err) {
        console.error(err);
        res.sendStatus(500);
      }
    }
  );

  app.post("/api/admin/active", checkJWT, isAdmin(rds), async (req, res) => {
    try {
      const uuid = await rds.GET(`email:${req.body.email}`);
      if (!uuid) {
        return res.sendStatus(400);
      }
      await rds.HSET(`uuid:${uuid}`, "active", req.body.active);
      res.send({ ok: true });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  app.get("/admin/profile/:email", (_, res) => {
    res.render("redirect", { title: "Loading" });
  });

  app.post(
    "/admin/profile/:email",
    checkJWT,
    getUserInfo(rds),
    isAdmin(rds),
    async (req, res) => {
      try {
        const uuid = await rds.GET(`email:${req.params.email}`);
        if (!uuid) {
          return res.sendStatus(400);
        }
        const target = await rds.HGETALL(`uuid:${uuid}`);
        res.render("edit-profile", {
          title: "Profile",
          target,
          user: req.user,
        });
      } catch (err) {
        console.error(err);
        res.sendStatus(500);
      }
    }
  );
}

function isAdmin(rds) {
  return async (req, res, next) => {
    const role = await rds.HGET(`uuid:${req.jwt.uuid}`, "role");
    if (!role || role !== "admin") {
      return res.status(401).send({ msg: "you are not admin" });
    }
    next();
  };
}
