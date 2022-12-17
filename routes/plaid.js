const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const { ensureLoggedIn } = require('../middleware/authenticate')
const moment = require('moment')


const {
    PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES,
    PLAID_REDIRECT_URI,
    plaid_client,
    PLAID_ANDROID_PACKAGE_NAME
} = require('../config')
const { BadRequestError } = require('../expressErrors')

router.post('/create-link-token', [ensureLoggedIn], async function (req, res, next) {
    const configs = {
        user: {
            client_user_id: 'user-id'
        },
        client_name: 'Piggy Bank',
        products: PLAID_PRODUCTS,
        country_codes: PLAID_COUNTRY_CODES,
        language: 'en'
    };

    if (PLAID_REDIRECT_URI !== '') {
        configs.redirect_uri = PLAID_REDIRECT_URI
    }

    if (PLAID_ANDROID_PACKAGE_NAME !== '') {
        configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
    }

    const createTokenResponse = await plaid_client.linkTokenCreate(configs);
    res.json(createTokenResponse.data);
})

router.post('/set-access-token', [ensureLoggedIn], async function (req, res, next) {
    try {
        const PUBLIC_TOKEN = req.body.public_token;
        console.log(PUBLIC_TOKEN)
        const tokenResponse = await plaid_client.itemPublicTokenExchange({
            public_token: PUBLIC_TOKEN
        });
        const ACCESS_TOKEN = tokenResponse.data.access_token
        await User.setAccessToken(res.locals.user.userId, ACCESS_TOKEN)
        res.json({
            message: 'success'
        })
    } catch (e) {
        next(e)
    }

})

router.get('/transactions', [ensureLoggedIn], async function (req, res, next) {
    try {
        // 30 days transaction
        const startDate = moment().subtract(90, 'days').format('YYYY-MM-DD')
        const endDate = moment().format('YYYY-MM-DD')
        const accessToken = await User.getAccessToken(res.locals.user.userId)
        console.log(accessToken, 'awdawed')
        if (!accessToken) {
            throw new BadRequestError(`User ${res.locals.user.username} is not connected to a bank yet!`)
        }
        const configs = {
            access_token: accessToken,
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