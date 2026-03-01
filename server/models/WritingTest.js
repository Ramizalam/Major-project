const mongoose = require('mongoose');

const WritingTestSchema = new mongoose.Schema({
  task1: {
    title: String,
    time: String,
    wordCount: Number,
    instructions: String,
    chartDescription: String,
  },
  task2: {
    title: String,
    time: String,
    wordCount: Number,
    question: String,
    tips: [String],
  },
});

module.exports = mongoose.model('WritingTest', WritingTestSchema);
