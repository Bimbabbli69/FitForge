const express = require('express');
const router = express.Router();
const Musclegroup = require('../models/musclegroup');

// Middleware to check if the user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

router.get('/', checkAuthenticated, async (req, res) => {
  let musclegroups;
  try {
    musclegroups = await Musclegroup.find().sort({ createdAt: 'desc' }).limit(10).exec();
  } catch {
    musclegroups = [];
  }
  res.render('index', { musclegroups: musclegroups });
});

module.exports = router;
