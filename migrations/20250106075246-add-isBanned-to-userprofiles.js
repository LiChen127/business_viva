'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('UserProfiles', 'isBanned', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // 默认值为1，表示初始等级
      comment: '是否被封禁',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('UserProfiles', 'isBanned');
  }
};
