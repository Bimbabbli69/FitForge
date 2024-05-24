const express = require('express');
const router = express.Router();
const Musclegroup = require('../models/musclegroup');
const Exercise = require('../models/exercise');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

// Hämta alla muskelgrupper
router.get('/', async (req, res) => {
    let query = Musclegroup.find();
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i')); // Söka baserat på titel
    }
    if (req.query.difficultyLevel != null && req.query.difficultyLevel !== '') {
        query = query.where('difficultyLevel').equals(req.query.difficultyLevel); // Filtrera baserat på difficulty level
    }
    try {
        const musclegroups = await query.exec(); // Hämta muskelgrupper
        res.render('musclegroups/index', {
            musclegroups: musclegroups,
            searchOptions: req.query // Behåll sökfältets innehåll
        });
    } catch {
        res.redirect('/');
    }
});

// Visa formulär för att skapa en ny muskelgrupp
router.get('/new', async (req, res) => {
    renderNewPage(res, new Musclegroup());
});

// Skapa en ny muskelgrupp
router.post('/', async (req, res) => {
    const musclegroup = new Musclegroup({
        title: req.body.title,
        exercise: req.body.exercise,
        difficultyLevel: req.body.difficultyLevel,
        duration: req.body.duration,
        description: req.body.description
    });

    saveCover(musclegroup, req.body.cover);

    try {
        const newMusclegroup = await musclegroup.save(); // Spara ny muskelgrupp i databasen
        res.redirect(`musclegroups/${newMusclegroup.id}`); // Omdirigera till den nya muskelgruppen
    } catch {
        renderNewPage(res, musclegroup, true); // Visa formulär för att skapa en ny muskelgrupp med felmeddelande
    }
});

// Visa en specifik muskelgrupp
router.get('/:id', async (req, res) => {
    try {
        const musclegroup = await Musclegroup.findById(req.params.id).populate('exercise').exec(); // Hämta muskelgrupp med ID
        res.render('musclegroups/show', { musclegroup: musclegroup });
    } catch {
        res.redirect('/');
    }
});

// Visa formulär för att redigera en muskelgrupp
router.get('/:id/edit', async (req, res) => {
    try {
        const musclegroup = await Musclegroup.findById(req.params.id); // Hämta muskelgrupp med ID
        renderEditPage(res, musclegroup); // Visa redigeringsformulär
    } catch {
        res.redirect('/');
    }
});

// Uppdatera en muskelgrupp
router.put('/:id', async (req, res) => {
    let musclegroup;
    try {
        musclegroup = await Musclegroup.findById(req.params.id); // Hämta muskelgrupp med ID
        musclegroup.title = req.body.title;
        musclegroup.exercise = req.body.exercise;
        musclegroup.difficultyLevel = req.body.difficultyLevel;
        musclegroup.duration = req.body.duration;
        musclegroup.description = req.body.description;
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(musclegroup, req.body.cover); // Spara bild
        }
        await musclegroup.save(); // Spara ändringar
        res.redirect(`/musclegroups/${musclegroup.id}`); // redirect till den uppdaterade muskelgruppen
    } catch {
        if (musclegroup != null) {
            renderEditPage(res, musclegroup, true); // Visa sidan med felmeddelandet
        } else {
            res.redirect('/');
        }
    }
});

// Ta bort en muskelgrupp
router.delete('/:id', async (req, res) => {
    let musclegroup;
    try {
        musclegroup = await Musclegroup.findById(req.params.id); // Hämta muskelgrupp med ID
        await musclegroup.deleteOne(); // Ta bort muskelgruppen
        res.redirect('/musclegroups'); // Omdirigera till listan av muskelgrupper
    } catch {
        if (musclegroup != null) {
            res.render('musclegroups/show', {
                musclegroup: musclegroup, errorMessage: 'Could not delete musclegroup'
            });
        } else {
            res.redirect('/');
        }
    }
});

// Visa formulär för att skapa en ny muskelgrupp
async function renderNewPage(res, musclegroup, hasError = false) {
   renderFormPage(res, musclegroup, 'new', hasError);
}

// Visa formulär för att redigera en muskelgrupp
async function renderEditPage(res, musclegroup, hasError = false) {
    renderFormPage(res, musclegroup, 'edit', hasError);
}

// Hantera visning av formulär för muskelgrupp
async function renderFormPage(res, musclegroup, form, hasError = false) {
    try {
        const exercises = await Exercise.find({});
        const params = {
            exercises: exercises,
            musclegroup: musclegroup
        };
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Musclegroup';
            } else {
                params.errorMessage = 'Error Creating Musclegroup';
            }
        }
        res.render(`musclegroups/${form}`, params); // Rendera formulärsidan
    } catch {
        res.redirect('/musclegroups');
    }
}

// Spara bildf
function saveCover(musclegroup, coverEncoded) {
    if (coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        musclegroup.coverImage = new Buffer.from(cover.data, 'base64');
        musclegroup.coverImageType = cover.type;
    }
}

module.exports = router;
