
const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const { BadRequestError } = require('../expressErrors')

router.post('/register', async function (req, res, next) {
    try {
        const data = req.body
        let response = await User.register({
            username: data.username,
            password: data.password
        })
        res.json(response);
    } catch(e) {
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
        res.json(user)
    } catch (e) {
        next(e)
    }
})

module.exports = router