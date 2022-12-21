
const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const { BadRequestError } = require('../expressErrors')
const { createToken } = require('../helpers/createJWT')

router.post('/register', async function (req, res, next) {
    try {
        const data = req.body
        let response = await User.register(data)
        const token = createToken(response)
        res.json({username: response.username, token});
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
        res.json({username: user.username, userId: user._id, token})
    } catch (e) {
        next(e)
    }
})

module.exports = router