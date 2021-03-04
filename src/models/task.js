const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    /**
     * 
     */
    owner: {
        // type of the task is mongoose ObjectId
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // name need to match 'User/ model name
    }
}, {
    timestamps: true,
})

const Task = mongoose.model('Tasks', taskSchema)

module.exports = Task