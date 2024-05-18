const express = require('express')
const router = express.Router()
const Exercise = require('../models/exercise')
const exercise = require('../models/exercise')
const musclegroup = require('../models/musclegroup')
const Musclegroup = require('../models/musclegroup')

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
    })
    try {
        const newExercise = await exercise.save()
        res.redirect(`exercises/${newExercise.id}`)
    } catch {
        res.render('exercises/new', {
            exercise: exercise, 
            errorMessage: 'Error creating Exercise'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id)
        const musclegroups = await Musclegroup.find({ exercise: exercise.id}).limit(6).exec()
        res.render('exercises/show', {
            exercise: exercise,
            musclegroupsByExercise: musclegroups
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id)
        if (exercise == null) {
            return res.redirect('/exercises');
        }
        res.render('exercises/edit', { exercise: exercise })
    } catch {
        res.redirect('/exercises')
    }
})

router.put('/:id', async (req, res) => {
    let exercise
    try {
        exercise = await Exercise.findById(req.params.id)
        exercise.name = req.body.name
        await exercise.save()
        res.redirect(`/exercises/${exercise.id}`)
    } catch {
        if (exercise == null) {
            res.redirect('/')
        } else {
            res.render('exercises/edit', {
                exercise: exercise, 
                errorMessage: 'Error updating Exercise'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let exercise;
    try {
      exercise = await Exercise.findById(req.params.id);
      if (!exercise) {
        return res.redirect('/');
      }
      await exercise.deleteOne();
      res.redirect('/exercises');
    } catch (err) {
      if (err.message === 'This exercise has muscle groups still') {
        res.redirect(`/exercises/${exercise._id}`);
      } else {
        res.redirect('/');
      }
    }
  });

module.exports = router