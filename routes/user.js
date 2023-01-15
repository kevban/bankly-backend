const express = require('express')
const Transaction = require('../models/transaction')
const router = new express.Router()
const { ensureLoggedIn } = require('../middleware/authenticate')
const User = require('../models/user')
const moment = require('moment')
const jsonschema = require('jsonschema');
const transactionSchema = require('../schemas/transactionSchema.json')
const { BadRequestError } = require('../expressErrors')

// return the stored transactions for the user
router.get('/transactions', ensureLoggedIn, async (req, res, next) => {
    try {
        const result = await Transaction.get(res.locals.user.user_id)
        res.json(result)
    } catch (e) {
        next(e)
    }
})

// add a single transaction to the database
// used when user wish to add transaction not from plaid service
router.post('/transactions', ensureLoggedIn, async (req, res, next) => {
    try {
        const data = req.body
        if (jsonschema.validate(data, transactionSchema)) {
            const transactionObj = {
                amount: Number(data.amount),
                bankly_category: data.bankly_category,
                category: data.category,
                date: data.date,
                name: data.name,
                transaction_id: data.transaction_id,
                account_name: data.account_name,
                user_id: res.locals.user.user_id
            }
            const result = await Transaction.add([transactionObj])
            res.json({ added: result })
        } else {
            throw BadRequestError('Invalid request body.')
        }
        
    } catch (e) {
        next(e)
    }
})

// edit a single transaction
router.patch('/transactions', ensureLoggedIn, async (req, res, next) => {
    try {
        const data = req.body
        if (jsonschema.validate(data, transactionSchema)) {
            const transactionObj = {
                amount: Number(data.amount),
                bankly_category: data.bankly_category,
                category: data.category,
                date: data.date,
                name: data.name,
                transaction_id: data.transaction_id,
                account_name: data.account_name,
                user_id: res.locals.user.user_id
            }
            const result = await Transaction.update(transactionObj)
            res.json({ updated: result.modifiedCount })
        } else {
            throw BadRequestError('Invalid request body.')
        }
        
    } catch (e) {
        next(e)
    }
})

router.delete('/transactions', ensureLoggedIn, async (req, res, next) => {
    try {
        const data = req.body
        const result = await Transaction.delete(data.transaction_id)
        res.json({ removed: result.deletedCount })
    } catch (e) {
        next(e)
    }
})

// get all user information
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const result = await User.getUser(res.locals.user.username)
        res.json({ ...result, password: null })
    } catch (e) {
        next(e)
    }
})

/**
 * Get a list of institutions connected to the current user
 */
router.get('/institutions', [ensureLoggedIn], async function (req, res, next) {
    try {
        const accessTokens = await User.getAccessToken(res.locals.user.user_id) || []
        const institutionList = []
        for (let accessToken of accessTokens) {
            institutionList.push(accessToken.institution)
        }
        res.json({ institutions: institutionList })
    } catch (e) {
        next(e)
    }
})

router.post('/categories', [ensureLoggedIn], async function (req, res, next) {
    try {
        const data = req.body
        const category = { id: data.id, iconId: data.iconId, name: data.name, color: data.color }
        const result = await User.addCategory(res.locals.user.user_id, category)
        res.json({ categoryAdded: result })
    } catch (e) {
        next(e)
    }
})

router.delete('/categories', [ensureLoggedIn], async function (req, res, next) {
    try {
        const data = req.body
        const result = await User.deleteCategory(res.locals.user.user_id, data.uuid)
        res.json({ categoryDeleted: result })
    } catch (e) {
        next(e)
    }
})

router.post('/tags', [ensureLoggedIn], async function (req, res, next) {
    try {
        const data = req.body
        const result = await User.addTag(res.locals.user.user_id, data.name)
        res.json({ tagAdded: result })
    } catch (e) {
        next(e)
    }
})

router.delete('/tags', [ensureLoggedIn], async function (req, res, next) {
    try {
        const data = req.body
        const result = await User.deleteTag(res.locals.user.user_id, data.name)
        res.json({ tagDeleted: result })
    } catch (e) {
        next(e)
    }
})

router.post('/rules', [ensureLoggedIn], async function (req, res, next) {
    try {
        const data = req.body
        const rule = { contains: data.contains, bankly_category: data.bankly_category }
        const addedRuleResult = await User.addRule(res.locals.user.user_id, rule)
        const appliedRuleResult = await Transaction.applyRule(res.locals.user.user_id, rule)
        res.json({ ruleAdded: addedRuleResult, transactionsChanged: appliedRuleResult })
    } catch (e) {
        next(e)
    }
})

router.delete('/rules', [ensureLoggedIn], async function (req, res, next) {
    try {
        const data = req.body
        const result = await User.deleteRule(res.locals.user.user_id, data.contains)
        res.json({ ruleDeleted: result })
    } catch (e) {
        next(e)
    }
})

module.exports = router