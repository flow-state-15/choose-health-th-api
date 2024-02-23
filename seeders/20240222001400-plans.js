"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("plans", [
      {
        planName: "Basic Plan",
        price: 10.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        planName: "Standard Plan",
        price: 20.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        planName: "Premium Plan",
        price: 40.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("plans", null, {});
  },
};
