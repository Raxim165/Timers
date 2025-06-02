const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { createSession, deleteSession } = require("./sessions");
const auth = require("./auth");

const router = express.Router();

router.post("/login", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const user = await req.db.collection("users-timers").findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.redirect("/?authError=true");
  }

  const sessionId = await createSession(req.db, user._id);
  res.cookie("sessionId", sessionId, { httpOnly: true }).redirect("/");
});

router.post("/signup", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await req.db.collection("users-timers").findOne({ username });
  if (existingUser) return res.status(409).send("Username already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  await req.db.collection("users-timers").insertOne({ username, passwordHash });
  res.redirect("/");
});

router.get("/logout", auth(), async (req, res) => {
  if (req.sessionId) {
    await deleteSession(req.db, req.sessionId);
    res.clearCookie("sessionId");
  }
  res.redirect("/");
});

module.exports = router;
