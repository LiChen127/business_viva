import 'reflect-metadata';
import 'dotenv/config';
import app from './app';
import { runMongodb } from './config/mongoodb.config';
import { init as initSequelize } from './config/sequelize.config';
import redisClient from './config/redis.config';
const port = process.env.PORT || 3000;

app.listen(port, async () => {
  try {
    console.log('Server starting...');

    // 分别初始化每个服务并打印状态
    try {
      await runMongodb();
      console.log('MongoDB initialized successfully');
    } catch (e) {
      console.error('MongoDB initialization failed:', e);
    }

    try {
      await redisClient.ping();
      console.log('Redis initialized successfully');
    } catch (e) {
      console.error('Redis initialization failed:', e);
    }

    try {
      await initSequelize();
      console.log('Sequelize initialized successfully');
    } catch (e) {
      console.error('Sequelize initialization failed:', e);
    }

    console.log(`server is running in http://localhost:${port}`);
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
});