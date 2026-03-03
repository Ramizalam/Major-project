const express = require('express');
const mongoose = require('mongoose');
const SpeakingTest = require('../models/SpeakingTest');
const { generateSpeakingFeedback } = require('../services/feedbackService');
const router = express.Router();

// GET /api/speaking
router.get('/', async (req, res) => {
  try {
    const docs = await SpeakingTest.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/speaking/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let doc;
    
    if (id && id.startsWith('full_')) {
      const index = parseInt(id.split('_')[1]) - 1;
      const docs = await SpeakingTest.find();
      doc = docs[index] || docs[0];
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await SpeakingTest.findById(id);
    } else {
      return res.status(400).json({ message: 'Invalid test ID format' });
    }

    if (!doc) return res.status(404).json({ message: 'Speaking test not found' });
    res.json(doc);
  } catch (err) {
    console.error("Speaking fetch error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/speaking/evaluate
router.post('/evaluate', async (req, res) => {
  try {
    const { transcript, partNumber } = req.body;
    if (!transcript) return res.status(400).json({ message: 'Transcript required' });
    const evaluation = await generateSpeakingFeedback(transcript, partNumber);
    res.json({ success: true, evaluation });
  } catch (err) {
    console.error("Speaking evaluate error:", err);
    res.status(500).json({ message: 'Evaluation error' });
  }
});

module.exports = router;