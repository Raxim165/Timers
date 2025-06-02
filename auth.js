const { ObjectId } = require("mongodb");

const findUserBySessionId = async (db, sessionId) => {
  const session = await db.collection("sessions-users").findOne({ sessionId });
  if (!session) return null;
  return db.collection("users-timers").findOne({ _id: new ObjectId(session.userId) });
};

const auth = () => async (req, _res, next) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) return next();

  const user = await findUserBySessionId(req.db, sessionId);
  req.user = user;
  req.sessionId = sessionId;
  next();
};

module.exports = auth;
