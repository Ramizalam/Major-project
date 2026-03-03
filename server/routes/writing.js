const express = require('express');
const mongoose = require('mongoose');
const WritingTest = require('../models/WritingTest');
const WritingSubmission = require('../models/WritingSubmission');
const { generateWritingFeedback } = require('../services/feedbackService');
const router = express.Router();

// GET /api/writing
router.get('/', async (req, res) => {
  try {
    const docs = await WritingTest.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/writing/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let doc;
    
    if (id && id.startsWith('full_')) {
      const index = parseInt(id.split('_')[1]) - 1;
      const docs = await WritingTest.find();
      doc = docs[index] || docs[0];
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await WritingTest.findById(id);
    } else {
      return res.status(400).json({ message: 'Invalid test ID format' });
    }

    if (!doc) return res.status(404).json({ message: 'Writing test not found' });
    res.json(doc);
  } catch (err) {
    console.error("Writing fetch error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/writing/evaluate
router.post('/evaluate', async (req, res) => {
  try {
    const { text, taskType } = req.body;
    if (!text || !taskType) return res.status(400).json({ message: 'Text and taskType required' });
    const feedback = await generateWritingFeedback(text, taskType);
    res.json({ success: true, feedback });
  } catch (err) {
    console.error("Writing evaluate error:", err);
    res.status(500).json({ message: 'Error evaluating writing' });
  }
});

module.exports = router;