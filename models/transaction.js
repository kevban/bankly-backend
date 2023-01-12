const { getDb } = require('../db')
const { BadRequestError, UnauthorizedError } = require('../expressErrors')
const { ObjectId } = require('mongodb')
const { countBy } = require('lodash')

class Transaction {

    /**
     * Add a list of transaction to the database
     * Does not add duplicate transactions with same id
     * @param {Array} transactions list of transaction objects
     * @returns {integer} equals to the number of documents inserted
     */
    static async add(transactions) {
        const db = getDb()
        let count = 0;
        await transactions.forEach(async (transaction) => {
            await db.collection('transactions').findOne({ transaction_id: transaction.transaction_id }, function (err, result) {
                if (!result) {
                    db.collection('transactions').insertOne(transaction, function (err, result) {
                        count++;
                    });
                }
            });
        })
        return count
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

    /**
     * Edit a single transaction
     * @param {Object} transaction a single transaction
     * @returns {Object} containing modified count
     */
    static async update(transaction) {
        const db = getDb()
        let res = await db.collection('transactions').updateOne({ transaction_id: transaction.transaction_id }, {
            $set: {
                ...transaction
            }
        });
        return res
    }

    /**
     * Delete a single transaction
     * @param {string} id a transaction id
     * @returns {Object} containing deleted count
     */
    static async delete(id) {
        const db = getDb()
        let res = await db.collection('transactions').deleteOne({ transaction_id: id })
        return res
    }


    /**
     * Update the bankly_category for all transactions in a User based on a rule
     * @param {string} userId
     * @param {object} rule
     * @returns {integer} number of transactions modified
     */
    static async applyRule(userId, rule) {
        const db = getDb()
        let count = 0
        await db.collection('transactions').find({ user_id: userId }).forEach(
            async (transaction) => {
                if (transaction.name.toLowerCase().includes(rule.contains)) {
                    let res2 = await db.collection('transactions').updateOne({_id: ObjectId(transaction._id)}, {$set: {bankly_category: rule.bankly_category}})
                    console.log(res2)
                    transaction.bankly_category = rule.bankly_category
                    count++
                }
            }
        )
        return count
    }

}


module.exports = Transaction