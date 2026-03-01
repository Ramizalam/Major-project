const mongoose = require('mongoose');

const WritingSubmissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WritingTest',
    required: true,
  },
  task1Response: {
    text: {
      type: String,
      default: '',
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
  },
  task2Response: {
    text: {
      type: String,
      default: '',
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'evaluated'],
    default: 'draft',
  },
  submittedAt: {
    type: Date,
  },
  score: {
    task1: {
      taskAchievement: Number,
      coherenceCohesion: Number,
      lexicalResource: Number,
      grammaticalRange: Number,
      overallBand: Number,
    },
    task2: {
      taskResponse: Number,
      coherenceCohesion: Number,
      lexicalResource: Number,
      grammaticalRange: Number,
      overallBand: Number,
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WritingSubmission', WritingSubmissionSchema);
