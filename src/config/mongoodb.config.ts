import mongoose, { model } from 'mongoose';

const URI = process.env.NODE_ENV === 'production'
  ? 'mongodb://mongodb:27018/viva?replicaSet=rs0'
  : 'mongodb://127.0.0.1:27018/viva?replicaSet=rs0&directConnection=true';

// 导入schema
import CommentContentModel from '@/db/collection/CommentContent.schema';
import PostContentModel from '@/db/collection/PostContent.schema';
import ContentModel from '@/db/collection/Content.schema';
import UserInteractionsModel from '@/db/collection/UserInteractions.schema';
import MediaResourceModel from '@/db/collection/MediaResource.schema';
import CrawledDataModel from '@/db/collection/CrawledData.schema';

const collections = [
  { name: 'posts', model: PostContentModel },
  { name: 'comments', model: CommentContentModel },
  { name: 'contents', model: ContentModel },
  { name: 'mediaResources', model: MediaResourceModel },
  { name: 'userInteractions', model: UserInteractionsModel },
  { name: 'crawledData', model: CrawledDataModel },
];

export const runMongodb = async () => {
  try {
    // 连接Mongodb, 导入schema
    const db = await mongoose.connect(URI);
    console.log(db.model);
    console.log('Running MongoDB Successfully!');
  } catch (error) {
    console.log('MongoDb running exit', error);
    process.exit(0);
  }
}

// let db: Db;

// export const runMongodb = async () => {
//   try {
//     await client.connect();
//     db = client.db('viva');
//     await mongoose.connect(URI, {
//       autoCreate: false, // 禁止自动创建集合
//     })
//     console.log('Mongoose connected successfully');
//     // 验证副本集状态
//     const adminDb = client.db('admin');
//     // 重试次数
//     let retries = 5;
//     while (retries > 0) {
//       try {
//         const status = await adminDb.command({ replSetGetStatus: 1 });
//         if (status.ok === 1) {
//           console.log('MongoDB replica set is ready!');
//           break;
//         }
//       } catch (e) {
//         console.log('Waiting for replica set initialization...');
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       }
//       retries--;
//     }
//     // 检查是否需要初始化集合
//     const currentCollections = await db.listCollections().toArray();

//     if (currentCollections.length < collections.length) {
//       console.log('First time initialization, creating collections...');
//       await initializeCollections();
//     } else {
//       console.log('Collections already exist, skipping initialization');
//     }
//     console.log('MongoDB connected with transaction support!');
//     return db;
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     throw error;
//   }
// }

// export const initializeCollections = async () => {
//   try {
//     for (const collection of collections) {
//       try {
//         // 将schema和collection关联, 导入mongodb
//         const collectionExists = await db.listCollections({ name: collection.name }).hasNext();
//         if (!collectionExists) {
//           await db.createCollection(collection.name);
//           console.log(`Collection ${collection.name} created`);
//           model(collection.name, collection.model.schema);
//         }
//       } catch (error) {
//         console.error(`initializeCollection error, collectionName ${collection.name}`, error);
//         throw error;
//       }
//     }
//   } catch (error) {
//     console.log('initializeCollection error', error);
//     throw error;
//   }
// }

// export const getDb = () => {
//   if (!db) {
//     throw new Error('DB not initialized!');
//   }
//   return db;
// }

// export default client;