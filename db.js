const { MongoClient } = require('mongodb')


require('dotenv').config();

let db;

const uri = process.env.DATABASE_URI;

async function connectDb(startServer) {
    if (process.env.NODE_ENV === "production") {
        let client = await MongoClient.connect(uri)
        db = client.db('piggy');
    } else {
        let client = await MongoClient.connect(uri)
        db = client.db('piggy_test');
    }
    startServer()
}

function getDb() {
    return db;
}


module.exports = {connectDb, getDb}





