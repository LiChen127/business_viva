'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 清空所有表
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('userprofiles', null, {});
    await queryInterface.bulkDelete('posts', null, {});
    await queryInterface.bulkDelete('comments', null, {});
    // ...添加其他需要清空的表
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
