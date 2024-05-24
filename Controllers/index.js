const express = require('express');
const router = express.Router();
const Musclegroup = require('../models/musclegroup');

// Middleware för att kolla om användaren är autentiserad
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // redirect till inloggningssidan om användaren inte är autentiserad
}

// Hämta och visa de senaste muskelgrupperna
router.get('/', checkAuthenticated, async (req, res) => {
  let musclegroups;
  try {
    // Hämta de senaste 10 muskelgrupperna efter skapelsedatum
    musclegroups = await Musclegroup.find().sort({ createdAt: 'desc' }).limit(10).exec();
  } catch {
    musclegroups = [];
  }
  res.render('index', { musclegroups: musclegroups }); // Rendera indexsidan med de hämtade muskelgrupperna
});

module.exports = router;
