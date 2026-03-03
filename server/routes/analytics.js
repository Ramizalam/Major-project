const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Progress = require('../models/Progress');
const { generatePersonalizedStudyPlan } = require('../services/feedbackService');

// @route   GET /api/analytics/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) progress = await Progress.create({ user: req.user._id });
    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
});

// @route   POST /api/analytics/generate-plan
router.post('/generate-plan', protect, async (req, res) => {
  try {
    const { level, weakAreas } = req.body;
    
    // Call Gemini AI
    const customPlan = await generatePersonalizedStudyPlan(level, weakAreas);

    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) progress = new Progress({ user: req.user._id });

    // Save the 30-day plan to Database
    progress.customPlan = customPlan;
    await progress.save();

    res.status(200).json({ message: 'Plan generated', plan: customPlan });
  } catch (error) {
    console.error("AI Generation Error: ", error);
    res.status(500).json({ message: 'Server error generating plan' });
  }
});

module.exports = router;