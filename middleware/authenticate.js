const { UnauthorizedError } = require('../expressErrors')
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require('../config');

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */
function authenticateJWT(req, res, next) {
    try {
        if (req.headers && req.headers.userToken) {
            const token = req.headers.userToken;
            res.locals.user = jwt.verify(token, SECRET_KEY)
        }
        next()
    } catch (e) {
        next();
    }
} 

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

 function ensureLoggedIn(req, res, next) {
    try {
      if (!res.locals.user) throw new UnauthorizedError();
      return next();
    } catch (err) {
      return next(err);
    }
  }

  module.exports = {
    authenticateJWT,
    ensureLoggedIn
  }