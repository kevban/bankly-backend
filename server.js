const app = require('./app')
const { PORT } = require('./config')
const { connectDb } = require('./db')

connectDb(() => {
    app.listen(PORT, function () {
        console.log(`App listening on ${PORT}`)
    })
})
