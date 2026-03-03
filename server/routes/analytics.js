const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Correctly extracting the function!
const User = require('../models/User');
const Progress = require('../models/Progress');
const { generatePersonalizedStudyPlan } = require('../services/feedbackService');

// @route   GET /api/analytics/dashboard
// Fetches the user's test history to populate the charts
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Initialize array if it doesn't exist
    if (!user.attemptsHistory) {
      user.attemptsHistory = [];
    }

    // Push the new score
    user.attemptsHistory.push({
      testId: testId || 'general_practice', // Groups tests on the dashboard
      module: module || 'mixed',
      score: score,
      attemptDate: new Date()
    });

    // We use markModified to ensure Mongoose saves the mixed array
    user.markModified('attemptsHistory');
    await user.save();

    res.json({ success: true, message: 'Score saved to dashboard' });
  } catch (err) {
    console.error("Save Score Error:", err);
    res.status(500).json({ message: 'Server error' });
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