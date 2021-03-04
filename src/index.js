const express = require('express')
// ensure the file run and ensure mongoose connect to database
require('./db/mongoose')

const userRouters = require('./routers/user');
const taskRouters = require('./routers/task')

const app = express()

const port = process.env.PORT

//Tell express to use json
app.use(express.json())



// const maintenance = (req, res, next) => {
//     res.status(503).send('Maintenance is on. Try again later')
// }

// Register the routers
app.use(userRouters)
app.use(taskRouters)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})