
const express = require('express');
const ReadingTest = require('../models/ReadingTest');
const { generateReadingFeedback } = require('../services/feedbackService');

const router = express.Router();

// GET /api/reading
router.get('/', async (req, res) => {
  try {
    const doc = await ReadingTest.findOne();
    if (!doc) return res.status(404).json({ message: 'Reading test not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reading/submit - Submit answers and get feedback
router.post('/submit', async (req, res) => {
  try {
    const { userAnswers } = req.body;

    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Get correct answers from the test
    const test = await ReadingTest.findOne();
    if (!test) {
      return res.status(404).json({ message: 'Reading test not found' });
    }

    // Calculate correct answers
    let correctCount = 0;
    const detailedResults = userAnswers.map((userAnswer, index) => {
      const correctAnswer = test.questions[index]?.correctAnswer;
      const isCorrect = userAnswer.toString().toLowerCase().trim() ===
        correctAnswer.toString().toLowerCase().trim();
      if (isCorrect) correctCount++;

      return {
        questionNumber: index + 1,
        userAnswer,
        correctAnswer,
        isCorrect
      };
    });

    // Generate comprehensive feedback
    const feedback = generateReadingFeedback(correctCount, userAnswers.length);

    res.json({
      success: true,
      submission: {
        totalQuestions: userAnswers.length,
        correctAnswers: correctCount,
        detailedResults
      },
      feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const { protect, admin } = require('../middleware/auth');

// POST /api/reading - Create or update reading test (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    // There should only be one reading test in this simple setup
    await ReadingTest.deleteMany({});

    const newTest = await ReadingTest.create(req.body);
    res.status(201).json(newTest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
