"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    static associate(models) {
      Plan.hasMany(models.User, { foreignKey: "planId", allowNull: true });
      Plan.hasMany(models.Step, { foreignKey: "planId", allowNull: false, onDelete: "CASCADE" });
      Plan.belongsToMany(models.Purchase, { foreignKey: "planId", through: models.Purchase });
    }
  }

  Plan.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      planName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: new DataTypes.FLOAT(2),
        allowNull: false,
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
      tableName: "plans",
      sequelize: sequelize,
    }
  );
  return Plan;
};
