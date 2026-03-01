const mongoose = require('mongoose');

const SpeakingPartSchema = new mongoose.Schema({
  title: String,
  duration: String,
  description: String,
  questions: [String],
});

const SpeakingTestSchema = new mongoose.Schema({
  parts: [SpeakingPartSchema],
});

module.exports = mongoose.model('SpeakingTest', SpeakingTestSchema);
