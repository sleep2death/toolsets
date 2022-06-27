export function getUserInfoHandler(rdb) {
  return async (req, res, next) => {
    try {
      const user = await rdb.hGetAll(`uuid:${req.jwt.uuid}`);
      if (!user) {
        return res.sendStatus(401);
      }
      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };
}
