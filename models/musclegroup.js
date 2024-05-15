const mongoose = require('mongoose')
const path = require('path')
const coverImageBasePath = 'uploads/musclegroupCovers'

const musclegroupSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    description: {
        type: String,
    },
    difficultyLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName: {
        type: String,
        required: true
    },
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Exercise'
    }
});

musclegroupSchema.virtual('coverImagepath').get(function() {
    if( this.coverImageName != null){
        return path.join('/', coverImageBasePath, this.coverImageName)
    }
})

module.exports = mongoose.model('Musclegroup', musclegroupSchema);
module.exports.coverImageBasePath = coverImageBasePath
