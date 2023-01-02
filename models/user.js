const { getDb } = require('../db')
const { BCRYPT_WORK_FACTOR } = require('../config')
const bcrypt = require('bcrypt')
const { BadRequestError, UnauthorizedError } = require('../expressErrors')
const { ObjectId } = require('mongodb')

class User {

    /**
     * Adding a user document to database
     * @param {username, password, firstName, lastName, email} registerInfo
     * @returns {username, first_name, last_name, email}
     */
    static async register(registerInfo) {
        const db = getDb()
        let user = await checkUserExist(registerInfo.username)
        if (!user) {
            let hashed_pwd = await bcrypt.hash(registerInfo.password, BCRYPT_WORK_FACTOR)
            let result = await db.collection('users').insertOne({
                username: registerInfo.username,
                password: hashed_pwd,
                first_name: registerInfo.firstName,
                last_name: registerInfo.lastName,
                email: registerInfo.email
            })
            return {
                username: registerInfo.username,
                first_name: registerInfo.firstName,
                last_name: registerInfo.lastName,
                email: registerInfo.email
            }
        } else {
            throw new BadRequestError('Duplciate username')
        }
    }

    /**
     * 
     * @param {username, password} loginInfo contains 
     * @returns {_id, username}
     */
    static async login(loginInfo) {
        let user = await checkUserExist(loginInfo.username)
        if (user) {
            let result = await bcrypt.compare(loginInfo.password, user.password)
            if (result) {
                return {
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                }
            } else {
                throw new UnauthorizedError("Invalid password")
            }
        } else {
            throw new UnauthorizedError('Username does not exist')
        }
    }

    /**
     * Add access token to data base for the user
     * @param {string} id as the user id
     * @param {string} accessToken as the access token
     */
    static async setAccessToken(id, accessToken, institution) {
        const db = getDb()
        const bank = await checkBankExist(institution.institution_id)
        if (bank) {
            const res = await db.collection('users').updateOne({ _id: ObjectId(id), "access_tokens.institution_id.institution_id": institution.institution_id }, {
                $set: {
                    "access_tokens.$":
                    {
                        access_token: accessToken,
                        institution
                    }
                }
            })
            return res
        } else {
            const res = await db.collection('users').updateOne({ _id: ObjectId(id) }, {
                $push: {
                    access_tokens:
                    {
                        access_token: accessToken,
                        institution
                    }
                }
            })

            return res
        }


    }

    /**
     * Retrieve the access token for the user
     * @param {string} id 
     * @returns {string} the access token, or null if access token is not found
     */
    static async getAccessToken(id) {
        const db = getDb()
        let res = await db.collection('users').findOne({ _id: ObjectId(id) })
        return res.access_tokens
    }

    /**
     * Add a custom category to the user profile
     * @param {string} category
     * @param {string} id
     * @param {string} color
     * @returns {object}
     */
    static async setCategory(id, category, color = 'blue') {
        const db = getDb()
        let res = await db.collection('users').updateOne({ _id: ObjectId(id) }, { $push: { categories: { tag: category, color: color } } })
        return res
    }
}

/**
 * Checks if the user exist by username
 * @param {string} username 
 * @returns an object containing user information, or null if user does not exist
 */
async function checkUserExist(username) {
    const db = getDb()
    let result = await db.collection('users').findOne({ username: username })
    return result
}

/**
 * Checks if the access token (bank) already exist
 * @param {string} institutionId
 * @returns an object containing bank information, or null if bakn does not exist
 */
async function checkBankExist(institutionId) {
    const db = getDb()
    let result = await db.collection('users').findOne({ "access_tokens.institution.institution_id": institutionId })
    return result
}
module.exports = User