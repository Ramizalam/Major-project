require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const readingRoutes = require('./routes/reading');
const listeningRoutes = require('./routes/listening');
const writingRoutes = require('./routes/writing');
const speakingRoutes = require('./routes/speaking');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

// Serve static files from public directory
app.use('/public', express.static('public'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts_prep';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI, { dbName: 'ielts_prep' })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/reading', readingRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/speaking', speakingRoutes);
