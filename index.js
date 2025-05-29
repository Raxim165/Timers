require("dotenv").config();
const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");
const auth = require("./auth");
const { MongoClient } = require("mongodb");

const app = express();

const clientPromise = MongoClient.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

app.use(async (req, res, next) => {
  try {
    const client = await clientPromise;
    req.db = client.db("Data");
    next();
  } catch (err) {
    next(err);
  }
});

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});
app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/timers", require("./timers"));
app.use("/", require("./users"));

app.get("/", auth(), async (req, res) => {
  res.render("index", {
    user: req.user,
    authError: req.query.authError === "true",
  });
});

app.use((err, req, res) => res.status(500).send(err.message));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
