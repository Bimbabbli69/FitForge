const mongoose = require('mongoose')
const Musclegroup = require('./musclegroup')

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

// Stoppar från att radera en exercise med en musclegroup
exerciseSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
      const musclegroups = await Musclegroup.find({ exercise: this._id });
      if (musclegroups.length > 0) {
        next(new Error('This exercise has muscle groups still'));
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  });

module.exports = mongoose.model('Exercise', exerciseSchema)