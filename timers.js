const express = require("express");
const { ObjectId } = require("mongodb");
const auth = require("./auth");

const router = express.Router();

router.use(auth());

router.get("/", async (req, res) => {
  const { isActive } = req.query;
  if (!req.user) return;
  let timers = await req.db.collection("timers").find({ userId: req.user._id }).toArray();

  if (isActive !== undefined) {
    const active = isActive === "true";
    timers = timers.filter((t) => t.isActive === active);
  }

  const updated = timers.map((t) => ({
    ...t,
    start: Number(t.start),
    end: typeof t.end === "string" ? Number(t.end) : t.end,
    progress: t.isActive ? Date.now() - t.start : null,
  }));

  res.json(updated);
});

router.post("/", async (req, res) => {
  const { description } = req.body;

  const newTimer = {
    userId: req.user._id,
    isActive: true,
    description,
    start: Date.now(),
  };

  const result = await req.db.collection("timers").insertOne(newTimer);
  res.status(201).json({ id: result.insertedId });
});

router.post("/:id/stop", async (req, res) => {
  let timerId;

  try {
    timerId = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ error: "Invalid timer ID" });
  }

  const timer = await req.db.collection("timers").findOne({
    _id: timerId,
    userId: req.user._id,
    isActive: true,
  });

  if (!timer) return res.status(404).json({ error: "Timer not found or already stopped" });

  const end = Date.now();
  const duration = end - timer.start;

  await req.db.collection("timers").updateOne({ _id: timerId }, { $set: { isActive: false, end, duration } });

  res.status(204).end();
});

module.exports = router;
