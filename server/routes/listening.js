const express = require('express');
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');
const { generateListeningFeedback } = require('../services/feedbackService');

const router = express.Router();

// GET /api/listening - Get ALL tests
router.get('/', async (req, res) => {
  try {
    const docs = await ListeningTest.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/listening/:id - Get SPECIFIC test safely
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let doc;
    
    if (id && id.startsWith('full_')) {
      const index = parseInt(id.split('_')[1]) - 1;
      const docs = await ListeningTest.find();
      doc = docs[index] || docs[0];
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await ListeningTest.findById(id);
    } else {
      return res.status(400).json({ message: 'Invalid test ID format' });
    }

    if (!doc) return res.status(404).json({ message: 'Listening test not found' });
    res.json(doc);
  } catch (err) {
    console.error("Listening fetch error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/listening/submit
router.post('/submit', async (req, res) => {
  try {
    const { testId, userAnswers } = req.body;
    let test;
    
    if (testId && testId.startsWith('full_')) {
        const index = parseInt(testId.split('_')[1]) - 1;
        const docs = await ListeningTest.find();
        test = docs[index] || docs[0];
    } else if (mongoose.Types.ObjectId.isValid(testId)) {
        test = await ListeningTest.findById(testId);
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

    const feedback = generateListeningFeedback(correctCount, userAnswers.length);
    res.json({ success: true, submission: { totalQuestions: userAnswers.length, correctAnswers: correctCount, detailedResults }, feedback });
  } catch (err) {
    console.error("Listening submit error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;