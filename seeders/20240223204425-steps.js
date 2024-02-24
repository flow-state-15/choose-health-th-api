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
    await queryInterface.bulkInsert(
      "steps",
      [
        {
          name: "Consultation",
          order: 1,
          planId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Session 1",
          order: 2,
          planId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Consultation",
          order: 1,
          planId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Session 1",
          order: 2,
          planId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Session 2",
          order: 3,
          planId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Session 3",
          order: 4,
          planId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Consultation",
          order: 1,
          planId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Session 1",
          order: 2,
          planId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Session 2",
          order: 3,
          planId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Session 3",
          order: 4,
          planId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Session 4",
          order: 5,
          planId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Session 5",
          order: 6,
          planId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
      );
    },
    
  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
    */
    await queryInterface.bulkDelete('steps', null, {});
  },
};
