const { getDb } = require('../db')
const { BCRYPT_WORK_FACTOR } = require('../config')
const bcrypt = require('bcrypt')
const { BadRequestError, UnauthorizedError } = require('../expressErrors')

class User {

    static async register(resgisterInfo) {
        const db = getDb()
        let user = await checkUserExist(resgisterInfo.username)
        console.log(user)
        if (!user) {
            let hashed_pwd = await bcrypt.hash(resgisterInfo.password, BCRYPT_WORK_FACTOR)
            let result = await db.collection('users').insertOne({ username: resgisterInfo.username, password: hashed_pwd })
            console.log(result, 'result')
            return result
        } else {
            throw new BadRequestError('Duplciate username')
        }
    }

    static async login(loginInfo) {
        let user = await checkUserExist(loginInfo.username)
        if (user) {
            console.log(loginInfo, user)
            let result = await bcrypt.compare(loginInfo.password, user.password)
            if (result) {
                return user
            } else {
                throw new UnauthorizedError("Invalid password")
            }
        } else {
            throw new UnauthorizedError('Username does not exist')
        }
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