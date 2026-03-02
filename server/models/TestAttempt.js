const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testCategory: { type: String, enum: ['Reading', 'Writing', 'Listening', 'Speaking', 'FullMock'], required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to the specific test taken
  score: { type: Number, required: true },
  maxScore: { type: Number, default: 9 },
  feedback: { type: String },
  weakAreas: [{ type: String }], // e.g., ["Lexical Resource", "Grammar"]
  timeSpentSeconds: { type: Number, default: 0 },
  attemptNumber: { type: Number, default: 1 },
  attemptDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestAttempt', testAttemptSchema);