const mongoose = require('mongoose');

const WritingTestSchema = new mongoose.Schema({
  title: String,
  task1: {
    prompt: String,
    minWords: Number,
    imageUrl: String
  },
  task2: {
    prompt: String,
    minWords: Number
  }
});

module.exports = mongoose.model('WritingTest', WritingTestSchema);