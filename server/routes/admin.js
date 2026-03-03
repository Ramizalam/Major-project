const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const ReadingTest = require('../models/ReadingTest');
const ListeningTest = require('../models/ListeningTest');
const WritingTest = require('../models/WritingTest');
const SpeakingTest = require('../models/SpeakingTest');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/tests
// @desc    Get counts of all tests
// @access  Private/Admin
router.get('/tests/summary', protect, admin, async (req, res) => {
  try {
    const readingCount = await ReadingTest.countDocuments();
    const listeningCount = await ListeningTest.countDocuments();
    const writingCount = await WritingTest.countDocuments();
    const speakingCount = await SpeakingTest.countDocuments();

    res.json({
        reading: readingCount,
        listening: listeningCount,
        writing: writingCount,
        speaking: speakingCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/tests/:module/:id
// @desc    Delete a specific test
// @access  Private/Admin
router.delete('/tests/:module/:id', protect, admin, async (req, res) => {
  try {
    const { module, id } = req.params;
    let result;

    switch(module) {
        case 'reading': result = await ReadingTest.findByIdAndDelete(id); break;
        case 'listening': result = await ListeningTest.findByIdAndDelete(id); break;
        case 'writing': result = await WritingTest.findByIdAndDelete(id); break;
        case 'speaking': result = await SpeakingTest.findByIdAndDelete(id); break;
        default: return res.status(400).json({ message: 'Invalid module' });
    }

    if (!result) return res.status(404).json({ message: 'Test not found' });
    res.json({ message: 'Test deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;