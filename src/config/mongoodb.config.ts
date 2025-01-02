import { MongoClient, ServerApiVersion } from 'mongodb';

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/viva';

export const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db: any;

export async function runMongodb() {
  try {
    await client.connect();
    db = client.db('viva'); // 指定数据库名
    console.log("MongoDB connected successfully!");
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