const express = require('express')
const { getDb } = require('../db')
const router = new express.Router()


const {
    PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES,
    PLAID_REDIRECT_URI,
    plaid_client,
    PLAID_ANDROID_PACKAGE_NAME
} = require('../config')

router.post('/create-link-token', async function (req, res, next) {
    const configs = {
        user: {
            client_user_id: 'user-id'
        },
        client_name: 'Plaid Quickstart',
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

router.post('/set-access-token', async function (req, res, next) {
    const db = getDb()
    try {
        const PUBLIC_TOKEN = req.body.publicToken;
        const tokenResponse = await plaid_client.itemPublicTokenExchange({
            public_token: PUBLIC_TOKEN
        });
        const ACCESS_TOKEN = tokenResponse.data.access_token;
        const ITEM_ID = tokenResponse.data.item_id
        let response = await db.collection('users').insertOne({access_token: ACCESS_TOKEN})
        // change this later. Access token stays in server
        res.json({
            access_token: ACCESS_TOKEN,
            userId: response.insertedId,
            item_id: ITEM_ID, // this is for plaid support
            error: null
        })
    } catch (e) {
        next(e)
    }
    
})


module.exports = router