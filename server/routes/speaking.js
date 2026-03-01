
const express = require('express');
const SpeakingTest = require('../models/SpeakingTest');
const { generateSpeakingFeedback } = require('../services/feedbackService');
const router = express.Router();
// GET /api/speaking - Get test questions
router.get('/', async (req, res) => {
  try {
    const doc = await SpeakingTest.findOne();
    if (!doc) return res.status(404).json({ message: 'Speaking test not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/speaking/evaluate - Evaluate user response with fluency-based feedback
router.post('/evaluate', async (req, res) => {
  try {
    const { transcript, partNumber, questionIndex } = req.body;

    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    // Evaluate based on IELTS speaking criteria with fluency focus
    const evaluation = await generateSpeakingFeedback(transcript, partNumber);

    res.json({
      success: true,
      evaluation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Evaluation error' });
  }
});

const { protect, admin } = require('../middleware/auth');

// POST /api/speaking - Create or update speaking test (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    await SpeakingTest.deleteMany({});

    const newTest = await SpeakingTest.create(req.body);
    res.status(201).json(newTest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
