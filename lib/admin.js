export function isAdmin(req, res, next) {
  if (!req.user.role || req.user.role !== "admin") {
    return res.sendStatus(403);
  }
  next();
}

const USERS_PER_PAGE = 10;
export function getAllUsers(rdb, cursor = 0) {
  return async (req, res, next) => {
    try {
      const result = await rdb.scan(cursor, {
        MATCH: "uuid:*",
        COUNT: USERS_PER_PAGE,
      });

      if (result.keys.length > 0) {
        const multi = rdb.multi();
        result.keys.forEach((key) => {
          multi.hGetAll(key);
        });
        req.users = await multi.exec();
        req.usersNextCursor = result.cursor;
      } else {
        req.users = [];
      }

      next();
    } catch (err) {
      log.error(err);
      res.sendStatus(500);
    }
  };
}
