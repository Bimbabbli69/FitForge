const express = require('express')
const router = express.Router()
const Musclegroup = require('../models/musclegroup')
const Exercise = require('../models/exercise')
const musclegroup = require('../models/musclegroup')
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
        res.redirect(`musclegroups/${newMusclegroup.id}`)
    } catch {
        renderNewPage(res, musclegroup, true)
    }
})

//Show Musclegroup Controller
router.get('/:id', async (req, res) => {
    try {
        const musclegroup = await Musclegroup.findById(req.params.id).populate('exercise').exec()
        res.render('musclegroups/show', { musclegroup: musclegroup})
    } catch {
        res.redirect('/')
    }
})

// Edit Musclegroup Controller
router.get('/:id/edit', async (req, res) => {
    try {
        const musclegroup = await Musclegroup.findById(req.params.id)
        renderEditPage(res, musclegroup)
    } catch {
        res.redirect('/')
    }
})

// Update musclegroup Controller
router.put('/:id', async (req, res) => {
    let musclegroup
    try {
        musclegroup = await Musclegroup.findById(req.params.id)
        musclegroup.title = req.body.title
        musclegroup.exercise = req.body.exercise
        musclegroup.difficultyLevel = req.body.difficultyLevel
        musclegroup.duration = req.body.duration
        musclegroup.description = req.body.description
        if (req.body.cover != null && req.body.cover!== '') {
            saveCover(musclegroup, req.body.cover)
        }
        await musclegroup.save()
        res.redirect(`/musclegroups/${musclegroup.id}`)
    } catch {
        if (musclegroup != null) {
            renderEditPage(res, musclegroup, true)
        } else {
            redirect('/')
        }
    }
})

//Delete Musclegroup Page
router.delete('/:id', async (req, res) => {
    let musclegroup
    try {
        musclegroup = await Musclegroup.findById(req.params.id)
        await musclegroup.deleteOne()
        res.redirect('/musclegroups')
    } catch {
        if (musclegroup != null) {
            res.render('musclegroups/show', {
                musclegroup: musclegroup, errorMessage: 'Could not delete musclegroup' 
            })
        } else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, musclegroup, hasError = false) {
   renderFormPage(res, musclegroup, 'new', hasError)
}

async function renderEditPage(res, musclegroup, hasError = false) {
    renderFormPage(res, musclegroup, 'edit', hasError)
}

async function renderFormPage(res, musclegroup, form, hasError = false) {
    try {
        const exercises = await Exercise.find({})
        const params = {
            exercises: exercises,
            musclegroup: musclegroup
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Musclegroup'
            } else {
                params.errorMessage = 'Error Creating Musclegroup'
            }
        }
        res.render(`musclegroups/${form}`, params)
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
