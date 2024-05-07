const express = require('express')
const router = express.Router()
const Exercise = require('../models/exercise')

// All exercises Controller
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const exercises = await Exercise.find(searchOptions)
        res.render('exercises/index', {
            exercises: exercises, 
            searchOptions: req.query 
        })
    } catch {
        res.redirect('/')
    }
})

// New exercise Controller
router.get('/new', (req, res) => {
    res.render('exercises/new', { exercise: new Exercise() })
})

// Create exercise Controller
router.post('/', async (req, res) => {
    const exercise = new Exercise({
        name: req.body.name
    });
    try {
        const newExercise = await exercise.save()
        // res.redirect(`exercises/${newExercise.id}`)
        res.redirect(`exercises`)
    } catch {
        res.render('exercises/new', {
            exercise: exercise, 
            errorMessage: 'Error creating Exercise'
        });
    }
})

module.exports = router