const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')

const router = express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    })
    try {
        await task.save()
        res.status(201).send(task)
    }
    catch (e) {
        res.status(400).send(e)
    }
})
/**
 * 
 */
// limit and skip
// Get /tasks?limit=10&skip=0 => skip 0 results, get first 10 results
// Get /tasks?limit=10&skip=10 => skip 10 results, get second set of 10 results
// Get /tasks?limit=10&skip=20 => skip 20 results, get third set of 10 results
// Get /tasks?sortBy=createAt:desc
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    if (req.query.completed)
        // the req.query.completed can be string('true') or boolean(true)
        match.completed = req.query.completed === 'true';
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)
    const sort = {}
    if (req.query.sortBy)
    {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1: 1;
    }
    try {
        const user = req.user;
        await user.populate({
            path: 'tasks',
            match,
            options: {
                limit,  // if limit is not a number it will be ignore => fetch all the result
                skip,   // if skip is not a number it will be ignore
                sort,
            }
        }).execPopulate();
        res.send(user.tasks)
    }
    catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if (!task)
            return res.status(400).send()
        res.send(task)
    }
    catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updateContent = req.body;
    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(updateContent);
    const isValidUpdated = updates.every(update => allowedUpdates.includes(update));
    if (!isValidUpdated)
        return res.status(400).send({'error': 'Invalid updates!'});

    const _id = req.params.id;
    
    try {   
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task)
            return res.status(404).send()
        Object.assign(task, updateContent)
        await task.save()

        res.send(task)
    }
    catch(error) {
        // validation error
        res.status(400).send()
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if (!task)
            return res.status(404).send()
        
            res.send(task)
    }
    catch (error) {
        res.status(500).send()
    }
})

module.exports = router