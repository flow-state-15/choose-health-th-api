"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Plan, { foreignKey: "planId", allowNull: true });
      User.hasMany(models.UserPlanStep, { foreignKey: "userId", onDelete: "CASCADE", as: 'planSteps' })
      User.hasMany(models.Purchase, { foreignKey: "userId" });
      // User.belongsToMany(models.Step, { foreignKey: "userId", through: models.UserPlanStep, onDelete: "CASCADE",
      // });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "plans",
          key: "id",
        },
      },
      planStepsCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      sequelize: sequelize,
    }
  );

  return User;
};
