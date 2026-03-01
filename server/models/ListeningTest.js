const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: String, // e.g., "1-10"
});

const ListeningTestSchema = new mongoose.Schema({
  sections: [SectionSchema],
  correctAnswers: [mongoose.Schema.Types.Mixed],
  questionTexts: {
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

module.exports = mongoose.model('ListeningTest', ListeningTestSchema);
