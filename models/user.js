const { getDb } = require('../db')
const { BCRYPT_WORK_FACTOR } = require('../config')
const bcrypt = require('bcrypt')
const getDefaultCategories = require('../helpers/defaultCategories')
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
        let user = await this.getUser(registerInfo.username)
        if (!user) {
            let hashed_pwd = await bcrypt.hash(registerInfo.password, BCRYPT_WORK_FACTOR)
            let result = await db.collection('users').insertOne({
                username: registerInfo.username,
                password: hashed_pwd,
                first_name: registerInfo.firstName,
                last_name: registerInfo.lastName,
                email: registerInfo.email,
                categories: getDefaultCategories(),
                tags: [],
                rules: [],
                sandbox: registerInfo.sandbox || false,
                connected: false
            })
            return {
                username: registerInfo.username,
                first_name: registerInfo.firstName,
                last_name: registerInfo.lastName,
                email: registerInfo.email,
                user_id: result.insertedId,
                sandbox: registerInfo.sandbox
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
        let user = await this.getUser(loginInfo.username)
        if (user) {
            let result = await bcrypt.compare(loginInfo.password, user.password)
            if (result) {
                return {
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    user_id: user._id
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
        const bank = await checkBankExist(id, institution.institution_id)
        let res;
        if (bank) {
            res = await db.collection('users').updateOne({ _id: ObjectId(id), "access_tokens.institution_id.institution_id": institution.institution_id }, {
                $set: {
                    "access_tokens.$":
                    {
                        access_token: accessToken,
                        institution
                    }
                }
            })
        } else {
            res = await db.collection('users').updateOne({ _id: ObjectId(id) }, {
                $push: {
                    access_tokens:
                    {
                        access_token: accessToken,
                        institution
                    }
                }
            })
        }
        await db.collection('users').updateOne({_id: ObjectId(id)}, {
            $set: {
                connected: true
            }
        })
        return res
        


    }

    /**
     * Retrieve the access token for the user
     * @param {string} id 
     * @returns {string} the access token, or null if access token is not found
     */
    static async getAccessToken(id) {
        const db = getDb()
        let res = await db.collection('users').findOne({ _id: ObjectId(id) })
        if (res) {
            return res.access_tokens
        } else {
            return null
        }
    }

    /**
 * Get user information by username
 * @param {string} username 
 * @returns an object containing user information, or null if user does not exist
 */
    static async getUser(username) {
        const db = getDb()
        let result = await db.collection('users').findOne({ username: username })
        return result
    }

    /**
     * Add a custom category to the user profile
     * @param {object} category
     * @returns {object}
     */
    static async addCategory(id, category) {
        const db = getDb()
        const res = await db.collection('users').updateOne({ _id: ObjectId(id) }, {
            $push: {
                categories:
                {
                    ...category
                }
            }
        })
        return res
    }

    /**
     * Delete a custom category to the user profile by id
     * @param {string} uuid id of the category
     * @returns {object}
     */
    static async deleteCategory(id, uuid) {
        const db = getDb()
        const res = await db.collection('users').updateOne({ _id: ObjectId(id) }, {
            $pull: {
                categories:
                {
                    id: uuid
                }
            }
        })
        return res
    }

    /**
     * Add a custom tag to the user profile
     * @param {name} name name of the tag
     * @returns {object}
     */
    static async addTag(id, name) {
        const db = getDb()
        const res = await db.collection('users').updateOne({ _id: ObjectId(id) }, {
            $push: {
                tags: name
            }
        })
        return res
    }

    /**
     * Delete a custom tag to the user profile by id
     * @param {string} name name of the tag
     * @returns {object}
     */
    static async deleteTag(id, name) {
        const db = getDb()
        const res = await db.collection('users').updateOne({ _id: ObjectId(id) }, {
            $pull: {
                tags: name
            }
        })
        return res
    }

    /**
     * Adds a custom rule to the user profile by id
     * @param {object} rule the rule object
     * @returns {object}
     */
    static async addRule(id, rule) {
        const db = getDb()
        
        const res = await db.collection('users').updateOne({ _id: ObjectId(id) }, {
            $push: {
                rules: rule
            }
        })
        return res
    }

    /**
     * Deletes a custom rule to the user profile by id
     * @param {string} contains the description which the rule contains
     * @returns {object}
     */
    static async deleteRule(id, contains) {
        const db = getDb()
        const res = await db.collection('users').updateOne({ _id: ObjectId(id) }, {
            $pull: {
                rules: {
                    contains
                }
            }
        })
        return res
    }

}




/**
 * Checks if the access token (bank) already exist
 * @param {string} institutionId
 * @returns an object containing bank information, or null if bakn does not exist
 */
async function checkBankExist(id, institutionId) {
    const db = getDb()
    let res = await db.collection('users').findOne({ _id: ObjectId(id) })
    const checkBank = (access_tokens, institutionId) => {
        let bank = access_tokens.find(val => val.institution.institution_id === institutionId)
        return bank
    }
    if (res && res.access_tokens) {
        return checkBank(res.access_tokens, institutionId)
    } else {
        return null
    }
}


module.exports = User