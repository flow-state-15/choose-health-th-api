const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const controllers = require("./controllers");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
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
app.get("/restore", controllers.restore);
app.post("/login", controllers.login);
app.post("/logout", controllers.logout);
app.post("/signup", controllers.signup);

// protected routes
app.use(controllers.protected);
app.get("/plans", controllers.plans);
app.get("/user/plan", controllers.userPlan);
app.get("/user/purchases", controllers.purchases);
app.patch("/user/step/:stepId", controllers.updateUserStep);
app.post("/purchase", controllers.purchase);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
