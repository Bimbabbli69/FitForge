const express = require('express')
const router = express.Router()
const Musclegroup = require('../models/musclegroup')

router.get('/', async (req, res) => {
    let musclegroups
    try{
        musclegroups = await Musclegroup.find().sort({ createdAt: 'desc'}).limit(10).exec()
    } catch{
        
        musclegroups = []
    }
    res.render('index', {musclegroups: musclegroups})
})

module.exports = router