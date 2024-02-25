const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const { User, Plan, Purchase, Step, UserPlanStep } = require("../../models");
const exp = require("constants");

// auth
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email, password } });

  if (!user) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.cookie("token", user.dataValues.token, { httpOnly: true, sameSite: "lax" });
  delete user.dataValues.password;
  delete user.dataValues.token;
  delete user.dataValues.createdAt;
  delete user.dataValues.updatedAt;
  res.json({ message: "Login successful", user });
});

exports.restore = asyncHandler(async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findOne({ where: { token }, attributes: ["id", "email", "planId"] });

  if (!user) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json({ message: "success", user });
});

exports.signup = asyncHandler(async (req, res) => {
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

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

// protected routes middleware
exports.protected = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  console.log(">>> token", token);
  if (!token) {
    req.user = null;
    res.clearCookie("token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findOne({ where: { token } });
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;
  next();
});

// CRUD

exports.plans = asyncHandler(async (req, res) => {
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

exports.userPlan = asyncHandler(async (req, res) => {
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

exports.purchases = asyncHandler(async (req, res) => {
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

exports.updateUserStep = asyncHandler(async (req, res) => {
  const user = req.user;
  const { stepId } = req.params;
  const { completed } = req.body;

  const allSteps = await UserPlanStep.findAll({
    where: { userId: user.id, planId: user.planId },
    include: [{ model: Step }],
  });

  const step = allSteps.find((userStep) => userStep.dataValues.id === +stepId);

  if (!step || !allSteps) {
    return res.status(400).json({ message: "Step not found" });
  }

  if (step.Step.dataValues.order > 1) {
    const previousStep = allSteps.find(
      (userStep) => userStep.Step.dataValues.order === step.Step.dataValues.order - 1
    );
    if (!previousStep.dataValues.completed) {
      return res.status(400).json({ message: "Previous step not completed" });
    }
  }

  await step.update({ completed });
  res.json({ message: "success", step });
});

exports.purchase = asyncHandler(async (req, res) => {
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
