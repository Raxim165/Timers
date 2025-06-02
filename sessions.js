const { nanoid } = require("nanoid");

const createSession = async (db, userId) => {
  const sessionId = nanoid();
  await db.collection("sessions-users").insertOne({ userId, sessionId });
  return sessionId;
};

const deleteSession = async (db, sessionId) => await db.collection("sessions-users").deleteOne({ sessionId });

module.exports = { createSession, deleteSession };
