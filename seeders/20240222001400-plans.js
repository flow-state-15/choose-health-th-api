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
        planName: "Basic",
        price: 10.0,
        steps: "Complete the Basic plan's steps.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        planName: "Pro",
        price: 20.0,
        steps: "Complete the Pro plan's steps.",
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
