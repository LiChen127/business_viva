import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const URI = process.env.NODE_ENV === 'production'
  ? 'mongodb://mongodb:27017/viva?replicaSet=rs0'
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
    await client.connect();
    db = client.db('viva');

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

    if (retries === 0) {
      throw new Error('Failed to initialize MongoDB replica set');
    }

    // 初始化集合和索引
    const collections = [
      'posts',
      'comments',
      'contents',
      'mediaResources',
      'userInteractions',
      'crawledData',
    ];

    await Promise.all(
      collections.map(async (collectionName) => {
        const collection = db.collection(collectionName);
        const exists = await db.listCollections({ name: collectionName }).hasNext();
        if (!exists) {
          await db.createCollection(collectionName);
        }
      })
    );

    await Promise.all([
      db.collection('posts').createIndex({ postId: 1 }, { unique: true }),
      db.collection('comments').createIndex({ commentId: 1 }, { unique: true }),
      db.collection('comments').createIndex({ postId: 1 }),
    ]);

    console.log("MongoDB connected with transaction support!");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export default client;