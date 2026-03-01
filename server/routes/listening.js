const express = require('express');
const ListeningTest = require('../models/ListeningTest');
const { generateListeningFeedback } = require('../services/feedbackService');

const router = express.Router();

// GET /api/listening
router.get('/', async (req, res) => {
  try {
    const doc = await ListeningTest.findOne();
    if (!doc) return res.status(404).json({ message: 'Listening test not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/listening/submit - Submit answers and get feedback
router.post('/submit', async (req, res) => {
  try {
    const { userAnswers } = req.body;

    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Get correct answers from the test
    const test = await ListeningTest.findOne();
    if (!test) {
      return res.status(404).json({ message: 'Listening test not found' });
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
    const feedback = generateListeningFeedback(correctCount, userAnswers.length);

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

// POST /api/listening - Create or update listening test (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    await ListeningTest.deleteMany({});

    const newTest = await ListeningTest.create(req.body);
    res.status(201).json(newTest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

