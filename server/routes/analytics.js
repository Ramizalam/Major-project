const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); 
const User = require('../models/User'); 
const Progress = require('../models/Progress'); // Restored Progress Model!
const { generatePersonalizedStudyPlan } = require('../services/feedbackService'); // Restored Gemini AI Link!

// @route   GET /api/analytics/dashboard
// Fetches the user's test history to populate the charts
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      progress: { 
        attemptsHistory: user.attemptsHistory || [] 
      } 
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/analytics/save
// Saves a new test result to the user's history
router.post('/save', protect, async (req, res) => {
  try {
    const { score, testId, module } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.attemptsHistory) {
      user.attemptsHistory = [];
    }

    user.attemptsHistory.push({
      testId: testId || 'general_practice',
      module: module || 'mixed',
      score: score,
      attemptDate: new Date()
    });

    user.markModified('attemptsHistory');
    await user.save();

    res.json({ success: true, message: 'Score saved to dashboard' });
  } catch (err) {
    console.error("Save Score Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/analytics/generate-plan
// THE MISSING ROUTE: Generates the 30-day AI curriculum
router.post('/generate-plan', protect, async (req, res) => {
  try {
    const { level, weakAreas } = req.body;
    
    // Call your Google Gemini service
    const customPlan = await generatePersonalizedStudyPlan(level, weakAreas);

    // Save the plan to the Progress database collection
    let progress = await Progress.findOne({ user: req.user.id });
    if (!progress) {
        progress = new Progress({ user: req.user.id });
    }

    progress.customPlan = customPlan;
    await progress.save();

    res.status(200).json({ message: 'Plan generated', plan: customPlan });
  } catch (error) {
    console.error("AI Generation Error: ", error);
    res.status(500).json({ message: 'Server error generating plan' });
  }
});

module.exports = router;