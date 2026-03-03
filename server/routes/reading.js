const express = require('express');
const mongoose = require('mongoose');
const ReadingTest = require('../models/ReadingTest');
const { generateReadingFeedback } = require('../services/feedbackService');

const router = express.Router();

// GET /api/reading - Get ALL tests
router.get('/', async (req, res) => {
  try {
    const docs = await ReadingTest.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reading/:id - Get SPECIFIC test safely
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let doc;
    
    if (id && id.startsWith('full_')) {
      const index = parseInt(id.split('_')[1]) - 1;
      const docs = await ReadingTest.find();
      doc = docs[index] || docs[0];
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await ReadingTest.findById(id);
    } else {
      return res.status(400).json({ message: 'Invalid test ID format' });
    }

    if (!doc) return res.status(404).json({ message: 'Reading test not found' });
    res.json(doc);
  } catch (err) {
    console.error("Reading fetch error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reading/submit
router.post('/submit', async (req, res) => {
  try {
    const { testId, userAnswers } = req.body;
    let test;
    
    if (testId && testId.startsWith('full_')) {
        const index = parseInt(testId.split('_')[1]) - 1;
        const docs = await ReadingTest.find();
        test = docs[index] || docs[0];
    } else if (mongoose.Types.ObjectId.isValid(testId || req.body._id)) {
        test = await ReadingTest.findById(testId || req.body._id);
    }
    
    if (!test) return res.status(404).json({ message: 'Test not found' });

    let correctCount = 0;
    const detailedResults = userAnswers.map((userAnswer, index) => {
      const allQuestions = test.sections.flatMap(s => s.questions);
      const correctAnswer = allQuestions[index]?.correctAnswer || '';
      const isCorrect = userAnswer.toString().toLowerCase().trim() === correctAnswer.toString().toLowerCase().trim();
      if (isCorrect) correctCount++;
      return { questionNumber: index + 1, userAnswer, correctAnswer, isCorrect };
    });

    const feedback = generateReadingFeedback(correctCount, userAnswers.length);
    res.json({ success: true, submission: { totalQuestions: userAnswers.length, correctAnswers: correctCount, detailedResults }, feedback });
  } catch (err) {
    console.error("Reading submit error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;