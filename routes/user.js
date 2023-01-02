const express = require('express')
const Transaction = require('../models/transaction')
const router = new express.Router()
const { ensureLoggedIn } = require('../middleware/authenticate')
const User = require('../models/user')
const moment = require('moment')

// return the stored transactions for the user
router.get('/transactions', ensureLoggedIn, (req, res, next) => {
    try {
        const result = Transaction.get(res.locals.user.userId)
        res.json(result)
    } catch (e) {
        next(e)
    }
})

router.post('/transactions', ensureLoggedIn, (req, res, next) => {
    try {
        const result = Transaction.get(res.locals.user.userId)
        res.json(result)
    } catch (e) {
        next(e)
    }
})

/**
 * Get a list of institutions connected to the current user
 */
router.get('/institutions', [ensureLoggedIn], async function (req, res, next) {
    try {
        const accessTokens = await User.getAccessToken(res.locals.user.userId) || []
        const institutionList = []
        for (let accessToken of accessTokens) {
            institutionList.push(accessToken.institution)
        }
        res.json({institutions: institutionList})
    } catch (e) {
        next(e)
    }
})

module.exports = router