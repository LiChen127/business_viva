'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 创建敏感词表
    await queryInterface.createTable('sensitivewords', {
      id: {
        type: Sequelize.BIGINT, // 自增主键
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      word: {
        type: Sequelize.STRING(255), // 敏感词
        allowNull: false,
        unique: true, // 防止重复
      },
      createdAt: {
        type: Sequelize.DATE, // 创建时间
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE, // 更新时间
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // 删除敏感词表
    await queryInterface.dropTable('sensitive_words');
  },
};
