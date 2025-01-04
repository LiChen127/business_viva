import 'reflect-metadata';
import 'dotenv/config';
import app from './app';
import { runMongodb } from './config/mongoodb.config';
import { init as initSequelize } from './config/sequelize.config';
import redisClient from './config/redis.config';

const port = process.env.PORT || 3000;

async function initializeServer() {
  try {
    // 按顺序初始化各个服务
    console.log('Initializing services...');

    // 1. 初始化 MongoDB
    await runMongodb();
    console.log('MongoDB initialized successfully');

    // 2. 初始化 Redis
    await redisClient.ping();
    console.log('Redis initialized successfully');

    // 3. 初始化 Sequelize
    await initSequelize();
    console.log('Sequelize initialized successfully');

    // 启动服务器
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

initializeServer();