// test-connection.js
const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017/secondChance";

async function testConnection() {
  try {
    const client = await MongoClient.connect(url);
    console.log("Connected successfully to MongoDB");

    const db = client.db("secondChance");
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections);

    await client.close();
  } catch (err) {
    console.error("Connection error:", err);
  }
}

testConnection();
