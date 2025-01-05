// import { program } from 'commander';
// import { execSync } from 'child_process';
// import * as path from 'path';
// import * as fs from 'fs';

// program
//   .version('1.0.0')
//   .description('Database management CLI');

// // 创建迁移
// program
//   .command('create:migration <name>')
//   .description('Create a new migration file')
//   .action((name) => {
//     const timestamp = new Date().toISOString().replace(/[-T:]|\.\d{3}Z$/g, '');
//     const fileName = `${timestamp}-${name}.js`;
//     const template = `'use strict';

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     try {
//       // 在这里写入迁移逻辑
      
//       console.log('Migration completed successfully');
//     } catch (error) {
//       console.error('Migration failed:', error);
//       throw error;
//     }
//   },

//   down: async (queryInterface, Sequelize) => {
//     try {
//       // 在这里写入回滚逻辑
      
//       console.log('Rollback completed successfully');
//     } catch (error) {
//       console.error('Rollback failed:', error);
//       throw error;
//     }
//   }
// };`;

//     fs.writeFileSync(path.join('migrations', fileName), template);
//     console.log(`Created migration file: ${fileName}`);
//   });

// // 创建种子文件
// program
//   .command('create:seed <name>')
//   .description('Create a new seed file')
//   .action((name) => {
//     const timestamp = new Date().toISOString().replace(/[-T:]|\.\d{3}Z$/g, '');
//     const fileName = `${timestamp}-${name}.js`;
//     const template = `'use strict';

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     try {
//       // 在这里写入种子数据
      
//       console.log('Seed completed successfully');
//     } catch (error) {
//       console.error('Seed failed:', error);
//       throw error;
//     }
//   },

//   down: async (queryInterface, Sequelize) => {
//     try {
//       // 在这里写入清理逻辑
      
//       console.log('Cleanup completed successfully');
//     } catch (error) {
//       console.error('Cleanup failed:', error);
//       throw error;
//     }
//   }
// };`;

//     fs.writeFileSync(path.join('seeders', fileName), template);
//     console.log(`Created seed file: ${fileName}`);
//   });

// // 执行迁移
// program
//   .command('migrate')
//   .description('Run all pending migrations')
//   .option('--env <env>', 'Environment to run migrations', 'development')
//   .action((options) => {
//     try {
//       execSync(`npx sequelize-cli db:migrate --env ${options.env}`, { stdio: 'inherit' });
//     } catch (error) {
//       console.error('Migration failed:', error);
//       process.exit(1);
//     }
//   });

// // 回滚迁移
// program
//   .command('migrate:undo')
//   .description('Revert the last migration')
//   .option('--env <env>', 'Environment to run migrations', 'development')
//   .action((options) => {
//     try {
//       execSync(`npx sequelize-cli db:migrate:undo --env ${options.env}`, { stdio: 'inherit' });
//     } catch (error) {
//       console.error('Migration rollback failed:', error);
//       process.exit(1);
//     }
//   });

// // 执行种子
// program
//   .command('seed')
//   .description('Run all seed files')
//   .option('--env <env>', 'Environment to run seeds', 'development')
//   .action((options) => {
//     try {
//       execSync(`npx sequelize-cli db:seed:all --env ${options.env}`, { stdio: 'inherit' });
//     } catch (error) {
//       console.error('Seeding failed:', error);
//       process.exit(1);
//     }
//   });

// // 重置数据库
// program
//   .command('reset')
//   .description('Reset database (drop all tables and re-run migrations)')
//   .option('--env <env>', 'Environment to reset', 'development')
//   .action((options) => {
//     try {
//       execSync(`npx sequelize-cli db:drop --env ${options.env}`, { stdio: 'inherit' });
//       execSync(`npx sequelize-cli db:create --env ${options.env}`, { stdio: 'inherit' });
//       execSync(`npx sequelize-cli db:migrate --env ${options.env}`, { stdio: 'inherit' });
//       execSync(`npx sequelize-cli db:seed:all --env ${options.env}`, { stdio: 'inherit' });
//     } catch (error) {
//       console.error('Reset failed:', error);
//       process.exit(1);
//     }
//   });

// // MongoDB 索引管理
// program
//   .command('mongo:indexes')
//   .description('Manage MongoDB indexes')
//   .option('--env <env>', 'Environment to run', 'development')
//   .action(async (options) => {
//     try {
//       const { client } = await import('../../src/config/mongoodb.config');

//       await client.connect();
//       // const db = client.db('viva');

//       // 删除现有索引
//       console.log('Dropping existing indexes...');
//       await db.collection('comments').dropIndexes();

//       // 创建新的非唯一索引
//       console.log('Creating new indexes...');
//       await db.collection('comments').createIndex(
//         { postId: 1 },
//         { unique: false }  // 确保不是唯一索引
//       );

//       console.log('MongoDB indexes updated successfully');
//       await client.close();
//     } catch (error) {
//       console.error('Failed to update MongoDB indexes:', error);
//       process.exit(1);
//     }
//   });

// // MongoDB 集合管理
// program
//   .command('mongo:collections')
//   .description('List all MongoDB collections')
//   .action(async () => {
//     try {
//       const { client } = await import('../../src/config/mongoodb.config');
//       await client.connect();
//       const db = client.db('viva');

//       const collections = await db.listCollections().toArray();
//       console.log('Collections:', collections.map(c => c.name));

//       await client.close();
//     } catch (error) {
//       console.error('Failed to list collections:', error);
//       process.exit(1);
//     }
//   });

// // MongoDB 清理
// program
//   .command('mongo:clean')
//   .description('Clean MongoDB collections')
//   .option('--collection <name>', 'Specific collection to clean')
//   .action(async (options) => {
//     try {
//       const { client } = await import('../../src/config/mongoodb.config');
//       await client.connect();
//       const db = client.db('viva');

//       if (options.collection) {
//         await db.collection(options.collection).deleteMany({});
//         console.log(`Cleaned collection: ${options.collection}`);
//       } else {
//         const collections = await db.listCollections().toArray();
//         for (const collection of collections) {
//           await db.collection(collection.name).deleteMany({});
//         }
//         console.log('Cleaned all collections');
//       }

//       await client.close();
//     } catch (error) {
//       console.error('Failed to clean MongoDB:', error);
//       process.exit(1);
//     }
//   });

// program.parse(process.argv); 