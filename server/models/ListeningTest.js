const mongoose = require('mongoose');

const ListeningTestSchema = new mongoose.Schema({
  title: String,
  sections: [{
    audioUrl: String,
    questions: [{
      number: Number,
      type: { type: String }, // 'multiple_choice', 'fill_in_the_blank'
      text: String,
      options: [String],
      correctAnswer: String
    }]
  }]
});

module.exports = mongoose.model('ListeningTest', ListeningTestSchema);