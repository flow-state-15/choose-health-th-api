const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();

const { sequelize, User, Plan, Purchase } = require("../models");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("short"));
app.use(compression());
app.use(helmet());

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

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
