import { Sequelize } from 'sequelize-typescript';
import User from '@/db/models/User.model';
import ActionsLogs from '@/db/models/ActionsLog.model';
import RecommendationRules from '@/db/models/RecommendationRules.model';
import ScheduledTasks from '@/db/models/ScheduledTasks.model';
import UserProfile from '@/db/models/UserProfile.model';
// 配置数据库连接信息
const sequelizeConfig = {
  host: process.env.NODE_ENV === 'production' ? process.env.MYSQL_HOST_ALIYUN : process.env.MYSQL_LOCAL_HOST,
  port: process.env.NODE_ENV === 'production' ? Number(process.env.MYSQL_PORT) : Number(process.env.MYSQL_LOCAL_PORT),
  username: process.env.NODE_ENV === 'production' ? process.env.MYSQL_USERNAME : process.env.MYSQL_LOCAL_USER,
  password: process.env.NODE_ENV === 'production' ? process.env.MYSQL_PASSWORD : process.env.MYSQL_LOCAL_PASSWORD,
  database: process.env.NODE_ENV === 'production' ? process.env.MYSQL_DATABASE : process.env.MYSQL_LOCAL_DATABASE,
  dialect: 'mysql',
};

// 初始化 Sequelize 实例
const sequelize = new Sequelize(
  sequelizeConfig.database,
  sequelizeConfig.username,
  sequelizeConfig.password,
  {
    host: sequelizeConfig.host,
    port: sequelizeConfig.port,
    dialect: 'mysql',
    logging: false, // 禁用日志
  }
);

// 初始化连接
const init = async () => {
  try {
    // 验证数据库连接
    await sequelize.authenticate();
    console.log('Sequelize connection has been established successfully.');

    // 修改为使用 addModels 方式
    sequelize.addModels([User, ActionsLogs, RecommendationRules, ScheduledTasks, UserProfile]);

    // 如果需要同步表结构
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export { sequelize, init };
