// /**
//  * Mongodb management script
//  */

// import * as path from "path";
// import * as fs from "fs";
// import { program } from "commander";

// program.version("1.0.0").description("MongoDB management CLI");

// /**
//  * List all collections in the database
//  */

// program
//   .command("mongo:collections")
//   .description("list all collections in the database")
//   .action(async (name) => {
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


// /**
//  * Create a new migration file
//  */

// program
//   .command("create:migration <name>")
//   .description("Create a new migration file")
//   .action(async (name) => {
//     const timestamp = new Date().toISOString().replace(/[-T:]|\.\d{3}Z/g, '');
//     const fileName = `${timestamp}-${name}.js`;
//     const template = `
//       'use strict';

//       module.exports = {
//         up: async (queryInterface, Sequelize) => {
//           try {
//             // write migration logic here
//             console.log('Migration completed successfully');
//           } catch (error) {
//             console.error('Migration failed:', error);
//             throw error;
//           }
//         },

//         down: async (queryInterface, Sequelize) => {
//           try {
//             // write rollback logic here

//             console.log('Rollback completed successfully');
//           } catch (error) {
//             console.error('Rollback failed:', error);
//             throw error;
//           }
//         }
//       };
//     `;

//     fs.writeFileSync(path.join('migrations', fileName), template);
//     console.log(`✅ Created migration file: ${fileName}`);
//   });

// /**
//  * Mongodb index management
//  */

// program
//   .command("mongo:indexes")
//   .description('Mangage indexes in the database')
//   .option('--env <env>', 'Environment to use', 'development')
//   .action(async (name, indexFieldName) => {
//     try {
//       const { client } = await import('../../src/config/mongoodb.config');
//       await client.connect();
//       const db = client.db('viva');
//       // 根据传进去的name参数，获取对应的集合
//       const collection = db.collection(name);
//       if (!collection) {
//         console.error(`Collection ${name} not found`);
//         process.exit(1);
//       }
//       console.log('Dropping existing indexes...');
//       // await db.collection('users').dropIndexes();
//       await collection.dropIndexes();

//       // 创建新的非唯一索引
//       console.log('Creating new indexes...');
//       await collection.createIndex(
//         { [indexFieldName]: 1 },
//         {
//           unique: false
//         }
//       )

//       console.log('MongoDB indexes updated successfully');

//       await client.close();
//     } catch (error) {
//       console.error('Failed to update MongoDB indexes:', error);
//       process.exit(1);
//     }
//   })

// /**
//  * 运行集合脚本
//  */

// // program
// //   .command("mongo:run-script <script>")
// //   .description('Run a script in the database')
// //   .action(async (script) => {
// //     try {
// //       const { client } = await import('../../src/config/mongoodb.config');
// //       await client.connect();
// //       const db = client.db('viva');
// //       // 运行脚本
// //       await import(path.resolve(script));
// //       console.log('Script executed successfully');

// //       await client.close();
// //     } catch (error) {
// //       console.error('Failed to run script:', error);
// //       process.exit(1);
// //     }
// //   });

// program.parse(process.argv);