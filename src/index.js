const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const crypto = require("crypto");
require("dotenv").config();

const { sequelize, User, Plan, Purchase, Step, UserPlanStep } = require("../models");

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

// todo: convert to storing tokens in user table
const sessionUsers = {};

// public routes

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
  const { token } = req.cookies || {};
  if (token) {
    delete sessionUsers[token];
  }
  const newToken = crypto.randomBytes(64).toString("hex");
  sessionUsers[newToken] = user.id;
  res.cookie("token", newToken, { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Login successful" });
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || email.length < 6) {
    return res.status(400).json({ message: "Email is invalid." });
  } else if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be 6 or more characters long." });
  }
  const { token } = req.cookies || {};

  if (token) {
    delete sessionUsers[token];
  }

  const user = await User.create({ email, password });
  const newToken = crypto.randomBytes(64).toString("hex");
  sessionUsers[newToken] = user.id;
  res.cookie("token", newToken, { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Signup successful", user });
});

app.post("/logout", async (req, res) => {
  const { token } = req.cookies;
  if (token) delete sessionUsers[token];
  req.user = null;
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

// protected routes

app.use(async (req, res, next) => {
  console.log("Cookies: ", req.cookies);
  console.log("Session Users: ", sessionUsers);
  const { token } = req.cookies || {};
  if (!req.cookies || !token) {
    req.user = null;
    res.clearCookie("token");
    if (req.cookies.user) {
      res.clearCookie("user");
    }
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findByPk(sessionUsers[token]);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  sessionUsers[token] = user.id;
  req.user = user;
  next();
});

app.get("/plans", async (req, res) => {
  const plans = await Plan.findAll({
    include: [
      {
        model: Step,
        as: "steps",
        attributes: ["name", "order"],
      },
    ],
  });
  res.json(plans);
});

app.get("/user/plan", async (req, res) => {
  const user = req.user;
  const plan = await Plan.findByPk(user.planId, {
    include: [
      {
        model: Step,
        as: "steps",
        attributes: ["id", "name", "order", "planId"],
      },
      {
        model: UserPlanStep,
        as: "userPlanSteps",
        attributes: ["id", "completed", "stepId", "updatedAt"],
      },
    ],
  });
  console.log("Plan: ", plan);
  if (!plan) {
    return res.status(404).json({ message: "Plan not found" });
  }
  res.json({ message: "success", plan });
});

app.get("/user/purchases", async (req, res) => {
  const user = req.user;
  const purchases = await Purchase.findAll({
    where: { userId: user.id },
    include: [
      {
        model: Plan,
        attributes: ["id", "planName", "price"],
      },
    ],
  });
  res.json({ message: "success", purchases });
});

app.patch("/user/step/:stepId", async (req, res) => {
  const { stepId } = req.params;
  const step = await UserPlanStep.findByPk(stepId);

  if (!step) {
    return res.status(400).json({ message: "Step not found" });
  }

  await step.update({ completed: true });
  res.json({ message: "success", step });
});

app.delete("/user/step/:stepId", async (req, res) => {
  const { stepId } = req.params;
  const step = await UserPlanStep.findByPk(stepId);

  if (!step) {
    return res.status(400).json({ message: "Step not found" });
  }

  await step.update({ completed: false });
  res.json({ message: "success", step });
});

app.post("/purchase", async (req, res) => {
  const { planId } = req.body;
  const user = req.user;
  const plan = await Plan.findByPk(planId);

  if (!plan) {
    return res.status(400).json({ message: "Plan not found" });
  }

  const purchase = await Purchase.create({ userId: user.id, planId: plan.id, total: plan.price });
  await user.update({ planId: plan.id });
  res.json({ message: "success", receipt: purchase });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
