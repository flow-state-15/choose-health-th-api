const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const crypto = require("crypto");
require("dotenv").config();

const { sequelize, User, Plan, Purchase } = require("../models");

const app = express();

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? "" : "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("short"));
app.use(compression());
app.use(helmet());

const sessionUsers = {};

app.use(async (req, res, next) => {
  console.log("Cookies: ", req.cookies);
  console.log("Session Users: ", sessionUsers);
  if (!req.cookies) next();
  const { token } = req.cookies || {};
  console.log("Token: ", token);

  if (token && sessionUsers[token]) {
    const user = await User.findByPk(sessionUsers[token]);
    req.user = user;
  } else {
    req.user = null;
    res.clearCookie("token");
    if (req.cookies.user) {
      res.clearCookie("user");
    }
  }

  next();
});

app.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    const plans = await Plan.findAll();
    res.json({ users, plans });
  } catch (e) {
    console.log("Error: ", e);
    res.status(500).json({ message: "Internal Server Error", error: e });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email, password } });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = crypto.randomBytes(64).toString("hex");
  sessionUsers[token] = user.id;
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Login successful" });
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || email.length < 6) {
    return res.status(400).json({ message: "Email is invalid." });
  } else if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be 6 or more characters long." });
  }
  const user = await User.create({ email, password });
  res.json({ message: "Signup successful", user });
});

app.post("/logout", async (req, res) => {
  const { token } = req.cookies;
  if (token) delete sessionUsers[token];
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

app.get("/plans", async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const plans = await Plan.findAll();
  res.json(plans);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
