const express = require('express')
const Transaction = require('../models/transaction')
const router = new express.Router()
const { ensureLoggedIn } = require('../middleware/authenticate')
const User = require('../models/user')
const moment = require('moment')

// return the stored transactions for the user
router.get('/transactions', ensureLoggedIn, async (req, res, next) => {
    try {
        const result = await Transaction.get(res.locals.user.user_id)
        res.json(result)
    } catch (e) {
        next(e)
    }
})

// add transactions to the database
router.post('/transactions', ensureLoggedIn, async (req, res, next) => {
    try {
        const result = await Transaction.get(res.locals.user.user_id)
        res.json(result)
    } catch (e) {
        next(e)
    }
})

// get all user information
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const result = await User.getUser(res.locals.user.username)
        res.json({...result, password: null})
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
        res.json({institutions: institutionList})
    } catch (e) {
        next(e)
    }
})

router.post('/categories', [ensureLoggedIn], async function (req, res, next) {
    try {
        const data = req.body
        const category = {iconId: data.iconId, name: data.name, color: data.color}
        const result = await User.addCategory(res.locals.user.user_id, category)
        res.json({categoryAdded: result})
    } catch (e) {
        next(e)
    }
})

module.exports = router