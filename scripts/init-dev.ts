import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.development' });

// 构建env.example文件
function createEnvFile() {
  const envContent = `
    NODE_ENV=development
    PORT=3000
    MYSQL_LOCAL_HOST=localhost
    MYSQL_LOCAL_PORT=3306
    MYSQL_LOCAL_USER=root
    MYSQL_LOCAL_PASSWORD=yourpassword
    MYSQL_LOCAL_DATABASE=exampledb
    REDIS_HOST=localhost
    REDIS_PORT=6379
    MONGODB_URI=examplemongodb
  `;

  fs.writeFileSync('.env.development', envContent.trim());
  console.log('✅ Created .env.development file');
}

/**
 * 启动 Docker 服务
 */
const startDockerServices = () => {
  try {
    console.log('🧹 Cleaning up existing containers...');
    // 停止并删除所有容器，同时删除所有匿名卷
    execSync('docker-compose -f docker-compose.dev.yml down -v', { stdio: 'inherit' });
    console.log('🚀 Starting Docker services...');
    // 启动所有服务
    execSync('docker-compose -f docker-compose.dev.yml up -d', { stdio: 'inherit' });
    console.log('⌛ Waiting for MongoDB replica set initialization...');
    // 增加等待时间，确保副本集完全初始化
    setTimeout(() => {
      console.log('✅ Development environment is ready!');
      console.log('You can now run: pnpm dev');
    }, 30000);
  } catch (error) {
    console.error('❌ Error starting services:', error);
    process.exit(1);
  }
}
/**
 * 创建 Docker Compose 开发环境文件
 */
const createDockerComposeDevFile = () => {
  const dockerComposeContent = `
    version: "3.8"

    services:
      mongodb:
        image: mongo:latest
        ports:
          - "27018:27017"
        volumes:
          - mongodb_data:/data/db

      redis:
        image: redis:latest
        ports:
          - "6379:6379"
        volumes:
          - redis_data:/data

      volumes:
        mongodb_data:
        redis_data:
    `;

  fs.writeFileSync('docker-compose.dev.yml', dockerComposeContent.trim());
  console.log('✅ Created docker-compose.dev.yml file');
}

const main = () => {
  console.log('🚀 Initializing development environment...');
  // 创建必要的配置文件
  if (!fs.existsSync('.env.development')) {
    createEnvFile();
  }
  if (!fs.existsSync('docker-compose.dev.yml')) {
    createDockerComposeDevFile();
  }
  // 启动服务
  startDockerServices();
}
main(); 