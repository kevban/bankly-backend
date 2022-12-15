"use strict";
const { Configuration, PlaidEnvironments, PlaidApi } = require("plaid");

require('dotenv').config();

/** Shared config for application; can be required many places. */

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001; 

// plaid variables
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_PRODUCTS = process.env.PLAID_PRODUCTS.split(',');
const PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES.split(',')
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || ''

const plaid_config = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET
        }
    }
})

const plaid_client = new PlaidApi(plaid_config)

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "piggy_test"
      : process.env.DATABASE_URL || "piggy";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;


module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI,
  PLAID_ANDROID_PACKAGE_NAME,
  plaid_client,
  plaid_config,
  getDatabaseUri,
};
