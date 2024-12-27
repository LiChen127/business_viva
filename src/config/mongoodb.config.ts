import { MongoClient, ServerApiVersion } from 'mongodb';

// const URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/viva';
const URI = 'mongodb://localhost:27018/viva';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // 如果不需要认证，可以注释掉下面这行
  // auth: {
  //   username: process.env.MONGODB_USER,
  //   password: process.env.MONGODB_PASSWORD
  // }
});

export async function runMongodb() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
// run().catch(console.dir);
export default runMongodb;