"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserPlanStep extends Model {
    static associate(models) {
      UserPlanStep.belongsTo(models.Plan, { foreignKey: "planId", allowNull: false });
      UserPlanStep.belongsTo(models.User, { foreignKey: "userId", allowNull: false });
      UserPlanStep.belongsTo(models.Step, { foreignKey: "stepId", allowNull: false });
    }
  }

  UserPlanStep.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      stepId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "steps", key: "id" },
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "plans", key: "id" },
      },
      completed: {
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
      tableName: "userPlanSteps",
      sequelize: sequelize,
      indexes: [
        {
          unique: false,
          fields: ["userId", , "planId"],
        },
      ],
    }
  );

  return UserPlanStep;
};
