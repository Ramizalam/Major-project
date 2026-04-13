const mongoose = require('mongoose');

const SpeakingTestSchema = new mongoose.Schema({
  title: String,
  part1: { questions: [String] },
  part2: { cueCard: String },
  part3: { questions: [String] }
});

module.exports = mongoose.model('SpeakingTest', SpeakingTestSchema);