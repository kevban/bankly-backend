/**
 * Express app for Piggy Bank
 */

const express = require("express")
const cors = require("cors")
const plaidRoutes = require('./routes/plaid')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const { NotFoundError } = require('./expressErrors')
const { authenticateJWT } = require('./middleware/authenticate')

const app = express();



app.use(express.json())
app.use(cors())
app.use(authenticateJWT)
app.use("/api/plaid", plaidRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;
    return res.status(status).json({
        error: { message, status }
    });
});


module.exports = app;