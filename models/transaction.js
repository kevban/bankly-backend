const { getDb } = require('../db')
const { BadRequestError, UnauthorizedError } = require('../expressErrors')
const { ObjectId } = require('mongodb')

class Transaction {

    /**
     * Add a list of transaction to the database
     * @param {Array} transactions list of transaction objects
     * @returns {object} transaction count
     */
    static async add(transactions) {
        const db = getDb()
        let result = await db.collection('transactions').insertMany(transactions)
        return result;
    }

    /**
     * Get all user transactions given userId
     * @param {string} userId
     * @returns {array} array of transaction objects
     */
    static async get(userId) {
        const db = getDb()
        let result = await db.collection('transactions').find({user_id: userId})
        return result;
    }

}


module.exports = Transaction