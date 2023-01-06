const { getDb } = require('../db')
const { BadRequestError, UnauthorizedError } = require('../expressErrors')
const { ObjectId } = require('mongodb')

class Transaction {

    /**
     * Add a list of transaction to the database
     * Does not add duplicate transactions with same id
     * @param {Array} transactions list of transaction objects
     * @returns {object} transaction count
     */
    static async add(transactions) {
        const db = getDb()
        transactions.forEach(transaction => {
            db.collection('transactions').findOne({ transaction_id: transaction.transaction_id }, function (err, result) {
                if (!result) {
                    db.collection('transactions').insertOne(transaction, function (err, result) {
                        console.log('Document inserted');
                    });
                }
            });
        })
    }

    /**
     * Get all user transactions given userId
     * @param {string} userId
     * @returns {array} array of transaction objects
     */
    static async get(userId) {
        const db = getDb()
        let result = await db.collection('transactions').find({ user_id: userId })
        let resultArr = []
        await result.forEach(val => resultArr.push(val))
        return resultArr;
    }

}


module.exports = Transaction