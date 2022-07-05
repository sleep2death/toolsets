import { checkJWT } from "./auth.js";

const USERS_PER_PAGE = 10

export function admin(app, rds) {
  app.handle('/admin/users', checkJWT, isAdmin, async (req, res) => {
    try {
      const result = await rdb.scan(cursor, {
        MATCH: 'uuid:*',
        COUNT: USERS_PER_PAGE
      })
      if (result.keys.length > 0) {
        const multi = rds.multi();
        result.keys.forEach((key) => {
          multi.hGetAll(key);
        });
        req.users = await multi.exec();
        // delete password from each user
        req.users.forEach((user) => {
          delete user.pwd;
        });
        req.usersNextCursor = result.cursor;
      } else {
        req.users = [];
      }
    } catch(e) {
      console.error(err)
      res.sendStatus(500)
    }
  })
}

export function isAdmin(req, res, next) {
    try {
      const role = await rds.HGET(`uuid:${req.jwt.uuid}`, 'role');
      if (role !== 'admin') {
        return res.status(401).send({msg: 'You are not admin'})
      }

      next()
    }catch(err) {
      console.error(err)
      res.sendStatus(500)
    }
}
