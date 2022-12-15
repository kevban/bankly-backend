const { MongoClient } = require('mongodb')


require('dotenv').config();

let db;

const uri = process.env.DATABASE_URI;

console.log(uri)

async function connectDb(startServer) {
    if (process.env.NODE_ENV === "production") {
        let client = await MongoClient.connect(uri)
        db = client.db();
    } else {
        let client = await MongoClient.connect(uri)
        db = client.db();
    }
    startServer()
}

function getDb() {
    return db;
}


module.exports = {connectDb, getDb}





