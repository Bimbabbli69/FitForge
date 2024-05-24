const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true //stoppar sparning av felaktig data
  },
  email: {
    type: String,
    required: true, //stoppar sparning av felaktig data
    unique: true
  },
  password: {
    type: String,
    required: true //stoppar sparning av felaktig data
  }
});

module.exports = mongoose.model('User', userSchema);
