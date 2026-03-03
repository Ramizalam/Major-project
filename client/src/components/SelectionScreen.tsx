import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Target, ArrowLeft, Sparkles, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SelectionScreen.css';

const SelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you SURE you want to permanently delete your account and all test history? This cannot be undone.')) {
      try {
        await fetch('http://localhost:5000/api/auth/delete', { method: 'DELETE', headers: { Authorization: `Bearer ${user?.token}` } });
        logout(); navigate('/');
      } catch (error) {
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  return (
    <div className="selection-container">
      <div className="ambient-glow"></div>
      <div style={{ position: 'absolute', top: '40px', width: '100%', padding: '0 40px', display: 'flex', justifyContent: 'space-between', zIndex: 20 }}>
        
        <motion.button className="back-btn" style={{ position: 'relative', top: 0, left: 0 }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate('/')}>
          <ArrowLeft className="back-icon" /> Back to Core
        </motion.button>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <motion.button className="back-btn" style={{ position: 'relative', top: 0, left: 0, borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }} onClick={handleDeleteAccount}>
            <Trash2 className="back-icon" size={18} /> Delete Account
          </motion.button>
          <motion.button className="back-btn" style={{ position: 'relative', top: 0, left: 0 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} onClick={handleLogout}>
            Disconnect <LogOut className="back-icon" size={18} />
          </motion.button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="selection-header">
        <div className="badge selection-badge mx-auto mb-4"><Sparkles className="badge-icon" /> Welcome, {user?.name || 'Agent'}</div>
        <h1 className="selection-title">Choose Your <span className="highlight-text">Path</span></h1>
        <p className="selection-subtitle">Select how you want to interact with the AI today.</p>
      </motion.div>

      <div className="selection-grid">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.05, translateY: -10 }} whileTap={{ scale: 0.98 }} className="path-card prep-card" onClick={() => navigate('/preparation')}>
          <div className="card-glow prep-glow"></div><BookOpen className="path-icon prep-icon" /><h2>Preparation</h2><p>Master the syllabus, take diagnostic tests, and get AI-curated YouTube video recommendations for your weak spots.</p><div className="path-action">Enter Syllabus &rarr;</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.05, translateY: -10 }} whileTap={{ scale: 0.98 }} className="path-card practice-card" onClick={() => navigate('/dashboard')}>
          <div className="card-glow practice-glow"></div><Target className="path-icon practice-icon" /><h2>Practice</h2><p>Take full-length mock tests under real exam conditions with instant AI grading and deep performance analytics.</p><div className="path-action">Enter Arena &rarr;</div>
        </motion.div>
      </div>
    </div>
  );
};
export default SelectionScreen;