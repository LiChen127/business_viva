import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import mongoose from 'mongoose';

const URI = process.env.NODE_ENV === 'production'
  ? 'mongodb://mongodb:27018/viva?replicaSet=rs0'
  : 'mongodb://localhost:27018/viva?replicaSet=rs0&directConnection=true';

export const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

let db: Db;

export async function runMongodb() {
  try {
    // 连接 MongoDB 原生客户端
    await client.connect();
    db = client.db('viva');

    // 连接 Mongoose，设置不自动创建集合
    await mongoose.connect(URI, {
      autoCreate: false, // 禁用自动创建集合
    });
    console.log('Mongoose connected successfully');

    // 验证副本集状态
    const adminDb = client.db('admin');
    let retries = 5;
    while (retries > 0) {
      try {
        const status = await adminDb.command({ replSetGetStatus: 1 });
        if (status.ok === 1) {
          console.log('MongoDB replica set is ready!');
          break;
        }
      } catch (e) {
        console.log('Waiting for replica set initialization...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      retries--;
    }

    // // 检查是否需要初始化集合
    // const collections = await listCollections();
    // if (collections.length === 0) {
    //   console.log('First time initialization, creating collections...');
    //   await initializeCollections();
    // } else {
    //   console.log('Collections already exist, skipping initialization');
    // }

    console.log("MongoDB connected with transaction support!");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// 初始化集合和索引
async function initializeCollections() {
  try {
    const collections = [
      'posts',
      'comments',
      'contents',
      'mediaResources',
      'userInteractions',
      'crawledData',
    ];

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`Collection ${collectionName} created`);

        // 创建必要的索引
        if (collectionName === 'posts') {
          await db.collection('posts').createIndex(
            { postId: 1 },
            { unique: true, background: true }
          );
        } else if (collectionName === 'comments') {
          await Promise.all([
            db.collection('comments').createIndex(
              { commentId: 1 },
              { unique: true, background: true }
            ),
            db.collection('comments').createIndex(
              { postId: 1 },
              { background: true }
            ),
          ]);
        }
      } catch (error) {
        console.error(`Error creating collection ${collectionName}:`, error);
      }
    }

    console.log('Collections and indexes initialized');
  } catch (error) {
    console.error('Error in initialization:', error);
    throw error;
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

// 列出所有集合
export async function listCollections() {
  try {
    const collections = await db.listCollections().toArray();
    return collections;
  } catch (error) {
    console.error('Error listing collections:', error);
    throw error;
  }
}

export default client;