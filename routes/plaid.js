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
const Transaction = require('../models/transaction')

// generate a link token to open plaid link
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

// takes a public_token, and request an access token from plaid. Store it in the database
// for that user.
// returns the bank information of the connected data
router.post('/set-access-token', [ensureLoggedIn], async function (req, res, next) {
    try {
        const PUBLIC_TOKEN = req.body.public_token;
        const tokenResponse = await plaid_client.itemPublicTokenExchange({
            public_token: PUBLIC_TOKEN
        });
        const ACCESS_TOKEN = tokenResponse.data.access_token
        const item = await plaid_client.itemGet({
            access_token: ACCESS_TOKEN
        })
        const institution = await plaid_client.institutionsGetById({
            institution_id: item.data.item.institution_id,
            country_codes: ['US', 'CA'],
            options: {
                include_optional_metadata: true
            }
        })
        const result = await User.setAccessToken(res.locals.user.user_id, ACCESS_TOKEN, institution.data.institution)
        res.json({
            message: 'success',
            res: result
        })
    } catch (e) {
        next(e)
    }

})

/* Get the 30 day most recent transactions of all connected banks of an user.
Stores the result in the database for that user
 headers: token: user jwt
 response: 
{transactions: [array of transactions]}
*/
router.get('/transactions', [ensureLoggedIn], async function (req, res, next) {
    try {
        // 30 days transaction
        const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD')
        const endDate = moment().format('YYYY-MM-DD')
        const accessTokens = await User.getAccessToken(res.locals.user.user_id)
        if (accessTokens) {
            const transactionArr = []
            
            for (let accessToken of accessTokens) {
                const configs = {
                    access_token: accessToken.access_token,
                    start_date: startDate,
                    end_date: endDate,
                    options: {
                        count: 250, // max 
                        offset: 0
                    }
                };
                const response = await plaid_client.transactionsGet(configs);
                if (response.data.transactions) {
                    response.data.transactions.forEach(transaction => {
                        const accountName = response.data.accounts.find(account => account.account_id === transaction.account_id).official_name;
                        const transactionObj = {
                            ...transaction,
                            account_name: accountName,
                            user_id: res.locals.user.user_id
                        }
                        transactionArr.push(transactionObj)
                    })
                }
            }
            if (transactionArr.length > 0) {
                await Transaction.add(transactionArr)
            }
            
            res.json({transactions: transactionArr})
        } else {
            res.json({transactions: []})
        }
    } catch (e) {
        next(e)
    }
})




module.exports = router