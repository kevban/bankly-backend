const express = require('express')
const moment = require('moment')
const router = new express.Router()
const { getDb } = require("../db")
const { ObjectId } = require('mongodb')

const {
    PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES,
    PLAID_REDIRECT_URI,
    plaid_client,
    PLAID_ANDROID_PACKAGE_NAME
} = require('../config')

router.get('/', async function (req, res, next) {
    try {
        const db = getDb()
        // 30 days transaction
        const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD')
        const endDate = moment().format('YYYY-MM-DD')
        const id = req.query.id
        let result = await db.collection('users').findOne({ _id: ObjectId(id) })
        const configs = {
            access_token: result.access_token,
            start_date: startDate,
            end_date: endDate,
            options: {
                count: 250, // max 
                offset: 0
            }
        };
        const transactionsResponse = await plaid_client.transactionsGet(configs);
        res.json(transactionsResponse.data)
    } catch (e) {
        res.json(e)
    }
    

})

module.exports = router