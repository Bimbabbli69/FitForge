const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise');
const Musclegroup = require('../models/musclegroup');

// Hämta alla övningar
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i'); // Case-insensitive sökning
    }
    try {
        const exercises = await Exercise.find(searchOptions); // Hämta övningar baserat på sökalternativ
        res.render('exercises/index', {
            exercises: exercises, 
            searchOptions: req.query // Behåll sökfältets värde
        });
    } catch {
        res.redirect('/');
    }
});

// Visa formulär för att skapa en ny övning
router.get('/new', (req, res) => {
    res.render('exercises/new', { exercise: new Exercise() });
});

// Skapa en ny övning
router.post('/', async (req, res) => {
    const exercise = new Exercise({
        name: req.body.name
    });
    try {
        const newExercise = await exercise.save(); // Spara ny övning i databasen
        res.redirect(`exercises/${newExercise.id}`); // redirect till ny exercise
    } catch {
        res.render('exercises/new', {
            exercise: exercise, 
            errorMessage: 'Error creating Exercise'
        });
    }
});

// Visa en specifik övning
router.get('/:id', async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id); // Hämta övning med ID
        const musclegroups = await Musclegroup.find({ exercise: exercise.id }).limit(6).exec(); // Hämta muskelgrupper kopplade till exercise
        res.render('exercises/show', {
            exercise: exercise,
            musclegroupsByExercise: musclegroups
        });
    } catch {
        res.redirect('/');
    }
});

// Visa formulär för att redigera en övning
router.get('/:id/edit', async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id); // Hämta övning med ID
        if (exercise == null) {
            return res.redirect('/exercises'); // Om övningen inte finns redirect till /exercises
        }
        res.render('exercises/edit', { exercise: exercise }); // vida edit sidan
    } catch {
        res.redirect('/exercises'); // redirect till /exercises vid fel
    }
});

// Uppdatera en övning
router.put('/:id', async (req, res) => {
    let exercise;
    try {
        exercise = await Exercise.findById(req.params.id); // Hämta övning med ID
        exercise.name = req.body.name;
        await exercise.save(); // Spara ändringar
        res.redirect(`/exercises/${exercise.id}`); // Omdirigera till den uppdaterade övningen
    } catch {
        if (exercise == null) {
            res.redirect('/'); // redirect till '/' om övningen inte finns
        } else {
            res.render('exercises/edit', {
                exercise: exercise, 
                errorMessage: 'Error updating Exercise'
            });
        }
    }
});

// Ta bort en övning
router.delete('/:id', async (req, res) => {
    let exercise;
    try {
        exercise = await Exercise.findById(req.params.id); // Hämta övning med ID
        if (!exercise) {
            return res.redirect('/'); // return '/' om övningen inte finns
        }
        await exercise.deleteOne(); // Ta bort övningen
        res.redirect('/exercises'); // redirect till exercises
    } catch (err) {
        if (err.message === 'This exercise has muscle groups still') {
            res.redirect(`/exercises/${exercise._id}`); // redirect om övningen har kopplade muskelkrupper
        } else {
            res.redirect('/');
        }
    }
});

module.exports = router;
