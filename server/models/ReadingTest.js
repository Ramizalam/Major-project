const mongoose = require('mongoose');

const PassageSchema = new mongoose.Schema({
  title: String,
  text: String,
  questions: Number,
});

const ReadingTestSchema = new mongoose.Schema({
  passages: [PassageSchema],
  correctAnswers: [mongoose.Schema.Types.Mixed],
  questionTexts: {
    // keys: "1", "2", "3" for passage numbers
    type: Map,
    of: [String],
    default: {},
  },
  questionOptions: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  }
});

module.exports = mongoose.model('ReadingTest', ReadingTestSchema);
