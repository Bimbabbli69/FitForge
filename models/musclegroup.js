const mongoose = require('mongoose')

const musclegroupSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true //stoppar sparning av felaktig data
    }, 
    description: {
        type: String,
    },
    difficultyLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true //stoppar sparning av felaktig data
    },
    duration: {
        type: Number,
        required: true //stoppar sparning av felaktig data
    },
    createdAt: {
        type: Date,
        required: true, //stoppar sparning av felaktig data
        default: Date.now
    },
    coverImage: {
        type: Buffer,
        required: true //stoppar sparning av felaktig data
    },
    coverImageType: {
        type: String,
        required: true //stoppar sparning av felaktig data
    },
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, //stoppar sparning av felaktig data
        ref: 'Exercise'
    }
});

musclegroupSchema.virtual('coverImagepath').get(function() {
    if( this.coverImage != null && this.coverImageType != null){
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

module.exports = mongoose.model('Musclegroup', musclegroupSchema);