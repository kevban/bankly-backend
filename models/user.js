const { getDb } = require('../db')
const { BCRYPT_WORK_FACTOR } = require('../config')
const bcrypt = require('bcrypt')
const { BadRequestError, UnauthorizedError } = require('../expressErrors')
const { ObjectId } = require('mongodb')

class User {

    /**
     * Adding a user document to database
     * @param {username, password} resgisterInfo
     * @returns {username, _id}
     */
    static async register(resgisterInfo) {
        const db = getDb()
        let user = await checkUserExist(resgisterInfo.username)
        console.log(user)
        if (!user) {
            let hashed_pwd = await bcrypt.hash(resgisterInfo.password, BCRYPT_WORK_FACTOR)
            let result = await db.collection('users').insertOne({ username: resgisterInfo.username, password: hashed_pwd })
            return { username: resgisterInfo.username, userId: result.insertedId }
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
                return { username: user.username, userId: user._id }
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
    static async setAccessToken(id, accessToken) {
        const db = getDb()
        await db.collection('users').updateOne({ _id: ObjectId(id) }, { $set: { access_token: accessToken } })
    }

    /**
     * Retrieve the access token for the user
     * @param {string} id 
     * @returns {string} the access token, or null if access token is not found
     */
    static async getAccessToken(id) {
        const db = getDb()
        let res = await db.collection('users').findOne({ _id: ObjectId(id) })
        return res.access_token
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
    console.log(result, username)
    return result
}

module.exports = User