const express = require('express')
const Transaction = require('../models/transaction')
const router = new express.Router()
const { ensureLoggedIn } = require('../middleware/authenticate')
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

module.exports = router