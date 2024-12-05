// db.js
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

async function connectToDatabase() {
    // MongoDB connection URL with authentication options
    let url = `${process.env.MONGO_URL}`;
        
    let dbInstance = null;
    const dbName = `${process.env.MONGO_DB}`;

    if (dbInstance){
        return dbInstance
    };

    const client = new MongoClient(url);      

    try {
        await client.connect();
        console.log("Connected to MongoDB successfully.");

        dbInstance = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);

        return dbInstance
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

module.exports = connectToDatabase;
