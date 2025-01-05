import { program } from "commander";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

program.version('1.0.0').description('mysql management CLI');
/**
 * 创建迁移文件脚本
 */
program
  .command('create:migration <name>')
  .description('Create a new migration file')
  .action(name => {
    const timestamp = new Date().toISOString().replace(/[-T:]|\.\d{3}Z/g, '');
    const fileName = `${timestamp}-${name}.js`;
    const template = `
      'use strict';

      module.exports = {
        up: async (queryInterface, Sequelize) => {
          try {
            // 在这里写入迁移逻辑

            console.log('Migration completed successfully');
          } catch (error) {
            console.error('Migration failed:', error);
            throw error;
          }
        },

        down: async (queryInterface, Sequelize) => {
          try {
            // 在这里写入回滚逻辑

            console.log('Rollback completed successfully');
          } catch (error) {
            console.error('Rollback failed:', error);
            throw error;
          }
        }
      };
    `;

    fs.writeFileSync(path.join('migrations', fileName), template);
    console.log(`❌ Created migration file: ${fileName}`);
  })

/**
 * 创建种子文件脚本
 */

program
  .command('create:seed <name>')
  .description('Create a new seed file')
  .action(name => {
    const timestamp = new Date().toISOString().replace(/[-T:]|\.\d{3}Z/g, '');
    const fileName = `${timestamp}-${name}.js`;
    const template = `
      'use strict';

      module.exports = {
        up: async (queryInterface, Sequelize) => {
          try {
            // 在这里写入种子数据

            console.log('Seed completed successfully');
          } catch (error) {
            console.error('Seed failed:', error);
            throw error;
          }
        },

        down: async (queryInterface, Sequelize) => {
          try {
            // 在这里写入清理逻辑

            console.log('Cleanup completed successfully');
          } catch (error) {
            console.error('Cleanup failed:', error);
            throw error;
          }
        }
      };
    `;

    fs.writeFileSync(path.join('seeders', fileName), template);
    console.log(`❌ Created seed file: ${fileName}`);
  })

/**
 * 运行迁移脚本
 */

program
  .command('migrate')
  .description('Run all pending migrations')
  .option('--env <env>', 'Environment to run migrations in', 'development')
  .action(option => {
    try {
      execSync(`npx sequelize-cli db:migrate --env ${option.env}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ cuowMigration failed:', error);
      process.exit(1);
    }
  })

/**
 * 回滚迁移脚本
 */

program
  .command('migrate:rollback')
  .description('Rollback the last migration')
  .option('--env <env>', 'Environment to run migrations in', 'development')
  .action(option => {
    try {
      execSync(`npx sequelize-cli db:migrate:undo --env ${option.env}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      process.exit(1);
    }
  })

/**
 * 运行种子脚本
 */

program
  .command('seed')
  .description('Run all seeders')
  .option('--env <env>', 'Environment to run seeders in', 'development')
  .action(option => {
    try {
      execSync(`npx sequelize-cli db:seed:all --env ${option.env}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    }
  })

/**
 * 回滚种子脚本
 */

program
  .command('seed:rollback')
  .description('Revert the last seed')
  .option('--env <env>', 'Environment to run seeders in', 'development')
  .action(option => {
    try {
      execSync(`npx sequelize-cli db:seed:undo --env ${option.env}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Seed rollback failed:', error);
      process.exit(1);
    }
  })

/**
 * 刷洗数据库
 */
program
  .command('flush_mysql_database')
  .description('Flush all tables in the database')
  .option('--env <env>', 'Environment to reset', 'development')
  .action(option => {
    try {
      execSync(`npx sequelize-cli db:drop --env ${option.env}`, { stdio: 'inherit' });
      execSync(`npx sequelize-cli db:create --env ${option.env}`, { stdio: 'inherit' });
      execSync(`npx sequelize-cli db:migrate --env ${option.env}`, { stdio: 'inherit' });
      execSync(`npx sequelize-cli db:seed:all --env ${option.env}`, { stdio: 'inherit' });
      console.log('✅ Database flushed successfully');
    } catch (error) {
      console.error('❌ Database flush failed:', error);
      process.exit(1);
    }
  })

// 解析命令行参数
program.parse(process.argv);