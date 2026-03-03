const mongoose = require('mongoose');

const ReadingTestSchema = new mongoose.Schema({
  title: String,
  sections: [{
    title: String,
    passage: String,
    questions: [{
      number: Number,
      type: { type: String }, // 'multiple_choice', 'true_false_not_given', 'fill_in_the_blank'
      text: String,
      options: [String],
      correctAnswer: String
    }]
  }]
});

module.exports = mongoose.model('ReadingTest', ReadingTestSchema);