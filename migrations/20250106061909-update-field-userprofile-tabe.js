'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      // 新增 level 字段
      queryInterface.addColumn('UserProfiles', 'level', {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 1, // 默认值为1，表示初始等级
        comment: '用户等级',
      }),
      // 新增 experiencePoints 字段
      queryInterface.addColumn('UserProfiles', 'experiencePoints', {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0, // 默认值为0，表示初始经验值
        comment: '用户经验值',
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    await Promise.all([
      // 删除 level 字段
      queryInterface.removeColumn('UserProfiles', 'level'),
      // 删除 experiencePoints 字段
      queryInterface.removeColumn('UserProfiles', 'experiencePoints'),
    ]);
  },
};
