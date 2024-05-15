const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Musclegroup = require('../models/musclegroup')
const Exercise = require('../models/exercise')

const uploadPath = path.join('public', 'uploads', 'musclegroupCovers')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

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
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file ? req.file.filename : null
    const musclegroup = new Musclegroup({
        title: req.body.title,
        exercise: req.body.exercise,
        difficultyLevel: req.body.difficultyLevel,
        duration: req.body.duration,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newMusclegroup = await musclegroup.save()
        res.redirect(`/musclegroups`)
    } catch {
        if (musclegroup.coverImageName != null){
            removeMusclegroupCover(musclegroup.coverImageName)
        }
        renderNewPage(res, musclegroup, true)
    }
})

function removeMusclegroupCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

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

module.exports = router
