const { MongoClient } = require('mongodb')


require('dotenv').config();

let db;

const uri = process.env.DATABASE_URI;
const client = new MongoClient(uri)

async function connectDb() {
    if (process.env.NODE_ENV === "production") {
        db = client.db('piggy');
    } else {
        db = client.db('piggy_test');
    }
    console.log('connected')
}

const initDb = () => {
    connectDb()
        .then(async res => {
            await db.collection('users').drop()
            await db.collection('transactions').drop()
            await db.collection('users').createIndex({ 'username': 1 }, {
                unique: true
            })
            await db.collection('transactions').createIndex({ 'transaction_id': 1 }, {
                unique: true
            })
        })
        .finally(() => {
            client.close()
        })
}

initDb();

