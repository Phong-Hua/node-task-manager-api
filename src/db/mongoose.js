const mongoose = require('mongoose')

const connectionURL = process.env.MONGODB_URL   // localhost can cause some issue

mongoose.connect(`${connectionURL}`, {
    useNewUrlParser: true,
    useCreateIndex: true, // ensure when mongoose work with mongodb, index is created allow us to quickly access data we need to access
    useFindAndModify: false,
})