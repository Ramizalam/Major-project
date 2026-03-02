const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalTimeSpent: { type: Number, default: 0 }, // In seconds
  totalTestsAttempted: { type: Number, default: 0 },
  syllabusChecklist: [{
    topic: { type: String },
    isCompleted: { type: Boolean, default: false }
  }],
  highestScores: {
    Reading: { type: Number, default: 0 },
    Writing: { type: Number, default: 0 },
    Listening: { type: Number, default: 0 },
    Speaking: { type: Number, default: 0 },
    FullMock: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Progress', progressSchema);