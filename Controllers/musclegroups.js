const express = require('express')
const router = express.Router()
const Musclegroup = require('../models/musclegroup')
const Exercise = require('../models/exercise')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
// All Musclegroups Controller
router.get('/', async (req, res) => {
    let query = Musclegroup.find()
    if (req.query.title != null && req.query.title != '' ){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.difficultyLevel != null && req.query.difficultyLevel !== '') {
        query = query.where('difficultyLevel').equals(req.query.difficultyLevel)
    }
    try {
        const musclegroups = await query.exec()
        res.render('musclegroups/index', {
            musclegroups: musclegroups,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New musclegroup Controller
router.get('/new', async (req, res) => {
    renderNewPage(res, new Musclegroup())
})

// Create musclegroup Controller
router.post('/', async (req, res) => {
    const musclegroup = new Musclegroup({
        title: req.body.title,
        exercise: req.body.exercise,
        difficultyLevel: req.body.difficultyLevel,
        duration: req.body.duration,
        description: req.body.description
    })

    saveCover(musclegroup, req.body.cover)

    try {
        const newMusclegroup = await musclegroup.save()
        // res.redirect(`musclegroups/${newMusclegroup.id}`)
        res.redirect(`/musclegroups`)
    } catch {
        renderNewPage(res, musclegroup, true)
    }
})

async function renderNewPage(res, musclegroup, hasError = false) {
    try {
        const exercises = await Exercise.find({})
        const params = {
            exercises: exercises,
            musclegroup: musclegroup
        }
        if (hasError) params.errorMessage = 'Error Creating Musclegroup'
        res.render('musclegroups/new', params)
    } catch {
        res.redirect('/musclegroups')
    }
}

function saveCover(musclegroup, coverEncoded){
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        musclegroup.coverImage = new Buffer.from(cover.data, 'base64')
        musclegroup.coverImageType = cover.type
    }
}

module.exports = router
