"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate(models) {
      Purchase.belongsToMany(models.User, { foreignKey: "userId", through: "Purchase" });
      Purchase.belongsToMany(models.Plan, { foreignKey: "planId", through: "Purchase" });
    }
  }

  Purchase.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "plans",
          key: "id",
        },
      },
      total: {
        type: DataTypes.FLOAT(2),
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
    { tableName: "purchases", sequelize: sequelize }
  );

  return Purchase;
};
