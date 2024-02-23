"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Step extends Model {
    static associate(models) {
      Step.belongsTo(models.Plan, { foreignKey: "planId", allowNull: false });
      Step.belongsToMany(models.User, { foreignKey: "stepId", through: models.UserPlanStep });
    }
  }

  Step.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "plans",
          key: "id",
        },
      },
    },
    {
      tableName: "steps",
      sequelize: sequelize,
    }
  );

  return Step;
};
