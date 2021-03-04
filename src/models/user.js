const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,   // validator
        trim: true,
    },
    /**
     * ...
     */ 
    email: {
        type: String,
        required: true,
        unique: true,   //ensure email is unique (as id)
        trim: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('Email is invalid');
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (value.trim().length <= 6)
                throw new Error('Password must be more than 6 characters');
            if (value.toLowerCase().includes('password'))
                throw new Error('Password must not contains "password"');
        },
        trim: true,
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer,
        // no need to perform validation because multer take care of it
    }
}, {
    timestamps: true,
})

userSchema.virtual('tasks', {   // name is not important here, 
    ref: 'Tasks',    // Tasks is the name of the model that has relationship with User
    localField: '_id',  // 
    foreignField: 'owner', // name of the field on Task model
})

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;   // delete it because it gonna slow-down 

    return userObject;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = [...user.tokens, {token}]
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user)
        throw new Error('Unable to login')  // we don't want the error to be specific for security reason
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
        throw new Error('Unable to login')  // we don't want the error to be specific for security reason
    return user;
}

// Middleware: Hash the plain text password before saving
// use standard function because we need binding
userSchema.pre('save', async function(next) {
    const user = this;
    
    // Check whether password is hashed or not
    // If password is hashed already, we don't want to hash again
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    // IMPORTANT: call next, when we finish running some code before save the uer
    next()
})

userSchema.pre('updateOne', async function(next){
    
    console.log('updateOne middleware')
    next();
})

userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({owner: user._id})
    next();
})

// define model
const User = mongoose.model('User', userSchema)

module.exports = User