'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. 尝试删除可能存在的唯一约束
      try {
        await queryInterface.removeConstraint('comments', 'comments_postId_unique');
      } catch (error) {
        console.log('postId unique constraint not found or already removed');
      }

      try {
        await queryInterface.removeConstraint('comments', 'comments_userId_unique');
      } catch (error) {
        console.log('userId unique constraint not found or already removed');
      }

      // 2. 修改 postId 列的类型
      await queryInterface.changeColumn('comments', 'postId', {
        type: Sequelize.BIGINT,
        allowNull: false,
      });

      // 3. 确保 commentCount 列存在
      const tableDescription = await queryInterface.describeTable('comments');
      if (!tableDescription.commentCount) {
        await queryInterface.addColumn('comments', 'commentCount', {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false,
        });
        console.log('Added commentCount column');
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 不提供回滚操作，因为这是结构优化
    console.log('No rollback needed');
  }
}; 