
const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const { BadRequestError } = require('../expressErrors')
const { createToken } = require('../helpers/createJWT')

/**
 * Register a user
 * Takes {username, first_name, last_name, password, email} as request
 * Response: {user: {username, first_name, last_name, email}, token}
 */
router.post('/register', async function (req, res, next) {
    try {
        const data = req.body
        let user = await User.register(data)
        const token = createToken(user)
        res.json({token});
    } catch (e) {
        next(e)
    }
})

router.post('/login', async function (req, res, next) {
    try {
        const data = req.body
        let user = await User.login({
            username: data.username,
            password: data.password
        })
        const token = createToken(user)
        res.json({token});
    } catch (e) {
        next(e)
    }
})

module.exports = router