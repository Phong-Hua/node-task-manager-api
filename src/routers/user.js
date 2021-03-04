const express = require('express');
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user');
const auth = require('../middleware/auth');
// const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')

// Create a new router
const router = express.Router()

// Create an instance, the file will be upload to dest folder
const avatarUpload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload jpg, jpeg or png file.'))
        cb(undefined, true)
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save();
        // sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken();
        res.status(201).send({user, token})
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {

        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({user, token})
        
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.post('/users/me/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
    // give sharp the original image and it will convert for us
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer

    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({'error': error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async(req, res) => {
    try {

        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        // set response header
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch (e) {
        res.status(404).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        // since we are authenticated, we can access req.user
        // remove the token attached on req from the list
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    }
    catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    }
    catch (e) {
        res.status(500).send()
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users)
    }
    catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req, res) => {

    // Additional: Check whether user trying to update is valid or not
    const allowedUpdates = ['name', 'password', 'email'];
    const updates = Object.keys(req.body);
    const isValidUpdated = updates.every(update => allowedUpdates.includes(update))
    if (!isValidUpdated)
        res.status(400).send({'error' : 'Invalid updates!'})

    try {
        const user = req.user;
        Object.assign(user, req.body)
        await user.save();

        // case 1
        res.send(user)
    }
    // case 2
    catch (e) {
        // we only worry about validation
        res.status(400).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.delete();
        // sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }
    catch(e) {
        // internal error
        res.status(500).send()
    }
})

module.exports = router