"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Plan, { foreignKey: "planId", allowNull: true });
      User.belongsToMany(models.Purchase, { foreignKey: "userId", through: "Purchase" });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      email: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      password: {
        type: new DataTypes.TEXT(),
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
