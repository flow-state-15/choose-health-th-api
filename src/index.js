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
    //!! todo: change * to vercel frontend url
    origin: process.env.NODE_ENV === "production" ? "*" : "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("short"));
app.use(compression());
app.use(helmet());

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
    res.clearCookie("token");
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // const newToken = crypto.randomBytes(64).toString("hex");
  // await user.update({ token: newToken });
  console.log(">>>>>> user.dataValues: ", user.dataValues);
  res.cookie("token", user.dataValues.token, { httpOnly: true, sameSite: "lax" });
  delete user.dataValues.password;
  delete user.dataValues.token;
  delete user.dataValues.createdAt;
  delete user.dataValues.updatedAt;
  res.json({ message: "Login successful", user });
});

app.get("/restore", async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findOne({ where: { token }, attributes: ["id", "email", "planId"] });

  if (!user) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // const newToken = crypto.randomBytes(64).toString("hex");
  // await user.update({ token: newToken });
  // res.cookie("token", newToken, { httpOnly: true, sameSite: "lax" });
  res.json({ message: "success", user });
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || email.length < 6) {
    return res.status(400).json({ message: "Email is invalid." });
  } else if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be 6 or more characters long." });
  }

  const newToken = crypto.randomBytes(64).toString("hex");
  const user = await User.create({ email, password, token: newToken });
  if (!user) {
    return res.status(400).json({ message: "Error creating user" });
  }

  delete user.dataValues.password;
  delete user.dataValues.token;
  delete user.dataValues.createdAt;
  delete user.dataValues.updatedAt;
  res.cookie("token", newToken, { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Signup successful", user });
});

app.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

// protected routes

app.use(async (req, res, next) => {
  const { token } = req.cookies;
  console.log(">>>>>> TOKEN: ", token);
  if (!token) {
    req.user = null;
    res.clearCookie("token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findOne({ where: { token } });
  if (!user) {
    console.log(">>>>>> USER NOT FOUND: ", user);
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;
  console.log(">>>>>> REQ USER: ", req.user);
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
        where: { userId: user.id, planId: user.planId },
      },
    ],
  });

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
  const user = req.user;
  const { stepId } = req.params;
  const { completed } = req.body;

  console.log(">>> user: ", user);

  const allSteps = await UserPlanStep.findAll({
    where: { userId: user.id, planId: user.planId },
    include: [{ model: Step }],
  });
  console.log(">>> allSteps: ", allSteps);

  const step = allSteps.find((userStep) => userStep.dataValues.id === +stepId);
  console.log(">>> step: ", step);

  if (!step || !allSteps) {
    return res.status(400).json({ message: "Step not found" });
  }

  if (step.Step.dataValues.order > 1) {
    const previousStep = allSteps.find(
      (userStep) => step.Step.dataValues.order - 1 === userStep.Step.dataValues.order - 1
    );
    console.log(">>> previousStep: ", previousStep);
    if (!previousStep.dataValues.completed) {
      return res.status(400).json({ message: "Previous step not completed" });
    }
  }

  await step.update({ completed });
  res.json({ message: "success", step });
});

app.post("/purchase", async (req, res) => {
  const { planId } = req.body;
  const user = req.user;

  if (user.planId) {
    try {
      const plan = await Plan.findByPk(user.planId, {
        include: [
          {
            model: UserPlanStep,
            as: "userPlanSteps",
            where: { userId: user.id, planId: user.planId },
          },
        ],
      });

      await Promise.all(
        plan.userPlanSteps.map((step) => {
          return step.destroy();
        })
      );
    } catch (e) {
      return res.status(500).json({ message: "Error processing the purchase.", error: e });
    }
  }
  const plan = await Plan.findByPk(planId, {
    include: [
      {
        model: Step,
        as: "steps",
      },
    ],
  });

  if (!plan) {
    return res.status(400).json({ message: "Plan not found" });
  }

  const purchase = await Purchase.create({ userId: user.id, planId: plan.id, total: plan.price });
  const userPlanSteps = await Promise.all(
    plan.steps.map((step) => {
      return UserPlanStep.create({ userId: user.id, planId: plan.id, stepId: step.id });
    })
  );

  if (!purchase || !userPlanSteps) {
    return res.status(500).json({ message: "Error processing the purchase." });
  }

  await user.update({ planId: plan.id });
  res.json({ message: "success", purchase });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
