import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, ExternalLink, Calendar, Youtube, ShoppingCart, Loader, BrainCircuit, List, HelpCircle } from 'lucide-react';
import axios from 'axios';
import './PreparationScreen.css';

// ==========================================
// STATIC RESOURCES & SYLLABUS DATA
// ==========================================
const RECOMMENDED_BOOKS = [
  { id: 1, title: 'Cambridge IELTS 18 Academic', desc: 'The gold standard. Real past exam papers published by Cambridge.', link: 'https://www.amazon.com/s?k=Cambridge+IELTS+18+Academic' },
  { id: 2, title: 'The Official Cambridge Guide to IELTS', desc: 'Perfect for beginners. Breaks down every question type.', link: 'https://www.amazon.com/s?k=The+Official+Cambridge+Guide+to+IELTS' },
  { id: 3, title: 'IELTS Advantage: Writing Skills', desc: 'The best book specifically for mastering Task 2 essays.', link: 'https://www.amazon.com/s?k=IELTS+Advantage+Writing+Skills' }
];

const RECOMMENDED_CHANNELS = [
  { id: 1, name: 'IELTS Advantage', desc: 'The most reliable channel for Writing Task 2 frameworks.', link: 'https://www.youtube.com/c/IELTSAdvantage' },
  { id: 2, name: 'E2 IELTS', desc: 'Excellent step-by-step methods from ex-examiners.', link: 'https://www.youtube.com/c/E2IELTS' },
  { id: 3, name: 'Algorithmic Web', desc: 'Master the tech and mindset required to ace computer-delivered tests.', link: 'https://www.youtube.com/' }
];

const SYLLABUS_ITEMS = {
  reading: ['Skimming & Scanning', 'True/False/Not Given', 'Matching Headings', 'Multiple Choice', 'Summary Completion'],
  writing: ['Task 1: Graph Analysis (Academic)', 'Task 1: Letter Writing (General)', 'Task 2: Opinion Essays', 'Task 2: Problem/Solution Essays', 'Complex Sentence Structures'],
  speaking: ['Part 1: Personal Questions', 'Part 2: The Cue Card (2 Min Talk)', 'Part 3: Abstract Discussion', 'Pronunciation & Intonation', 'Using Idioms Naturally'],
  listening: ['Map Labeling', 'Form/Note Completion', 'Multiple Choice', 'Matching Features', 'Following Distractors']
};

const DIAGNOSTIC_QUESTIONS = [
  { section: 'reading', type: 'Reading Comprehension', text: "Read: 'The Amazon rainforest is experiencing unprecedented drought.'\nQuestion: The drought is a common occurrence.", options: ["True", "False", "Not Given"], correct: 1 },
  { section: 'reading', type: 'Vocabulary', text: "What does 'arduous' mean?", options: ["Quick", "Difficult", "Expensive"], correct: 1 },
  { section: 'grammar', type: 'Lexical Resource', text: "The government implemented the policy to ________ the crisis.", options: ["stop", "mitigate", "help"], correct: 1 },
  { section: 'grammar', type: 'Linking Words', text: "Which word shows contrast?", options: ["Furthermore", "Consequently", "Nevertheless"], correct: 2 },
  { section: 'listening', type: 'Distractors', text: "Heard: 'It begins at quarter to three, not half past two.'\nWhen does it start?", options: ["2:30", "2:45", "3:15"], correct: 1 },
  { section: 'listening', type: 'Synonyms', text: "Heard: 'The project is highly cost-effective.'\nQuestion: The project is ________.", options: ["Expensive", "Affordable", "Beautiful"], correct: 1 }
];

const PreparationScreen: React.FC = () => {
  const navigate = useNavigate();
  
  const [appState, setAppState] = useState<'onboarding' | 'diagnostic' | 'analyzing' | 'dashboard'>('onboarding');
  const [activeTab, setActiveTab] = useState<'plan' | 'syllabus' | 'resources'>('plan');
  
  const [userLevel, setUserLevel] = useState('Intermediate');
  const [customPlan, setCustomPlan] = useState<any[]>([]);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState({ reading: 0, listening: 0, grammar: 0 });

  const [completedItems, setCompletedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('ielts_syllabus_progress');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ielts_syllabus_progress', JSON.stringify(completedItems));
  }, [completedItems]);

  const toggleItem = (item: string) => {
    setCompletedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        let token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await axios.get('http://localhost:5000/api/analytics/dashboard', { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.progress?.customPlan?.length > 0) {
          setCustomPlan(res.data.progress.customPlan);
          setAppState('dashboard');
        }
      } catch (err) { console.log('No existing plan.'); }
    };
    fetchDashboard();
  }, []);

  const handleManualSelection = async (level: string) => {
    setAppState('analyzing');
    setUserLevel(level);
    const defaultWeakAreas = level === 'Beginner' ? ["Basic Grammar", "Reading Strategies"] : ["Advanced Lexical Resource", "Task 2 Structure"];
    await generateAIPlan(level, defaultWeakAreas);
  };

  const handleQuizAnswer = async (selectedIndex: number) => {
    const currentQ = DIAGNOSTIC_QUESTIONS[quizStep];
    const isCorrect = selectedIndex === currentQ.correct;
    setAnswers(prev => ({ ...prev, [currentQ.section]: prev[currentQ.section as keyof typeof prev] + (isCorrect ? 1 : 0) }));

    if (quizStep < DIAGNOSTIC_QUESTIONS.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      setAppState('analyzing');
      const totalScore = answers.reading + answers.grammar + answers.listening + (isCorrect ? 1 : 0);
      let calculatedLevel = totalScore >= 5 ? 'Advanced (Band 7.5+)' : (totalScore >= 3 ? 'Intermediate (Band 6.0-7.0)' : 'Beginner');
      setUserLevel(calculatedLevel);

      const weakAreas = [];
      if (answers.reading < 2) weakAreas.push("Reading Comprehension & Inference");
      if (answers.grammar < 2) weakAreas.push("Advanced Grammar & Vocabulary");
      if (answers.listening < 2) weakAreas.push("Listening Distractors");
      if (weakAreas.length === 0) weakAreas.push("Timing Optimization");

      await generateAIPlan(calculatedLevel, weakAreas);
    }
  };

  const generateAIPlan = async (level: string, weakAreas: string[]) => {
    try {
      let token = localStorage.getItem('token');
      
      const res = await axios.post('http://localhost:5000/api/analytics/generate-plan', 
        { level, weakAreas }, { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCustomPlan(res.data.plan);
      setAppState('dashboard');
    } catch (err) {
      console.error(err);
      alert("AI Generation took too long or backend is asleep. Try again.");
      setAppState('onboarding');
      setQuizStep(0);
    }
  };

  return (
    <div className="prep-container">
      <div className="prep-ambient-glow"></div>
      <div className="prep-top-bar">
        <motion.button className="back-btn" onClick={() => navigate('/selection')}><ArrowLeft className="back-icon" /> Back</motion.button>
        <h1 className="top-title">Preparation <span className="highlight-text">Hub</span></h1>
      </div>

      <AnimatePresence mode="wait">
        {appState === 'onboarding' && (
          <motion.div key="onboarding" className="onboarding-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2.5rem', color: '#06b6d4', marginBottom: '10px' }}>Your AI Curriculum</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '1.2rem' }}>How would you describe your English proficiency?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              <button className="not-confident-btn" style={{background: 'rgba(30,41,59,0.8)', color: 'white'}} onClick={() => handleManualSelection('Beginner')}>Beginner (Band 5-6)</button>
              <button className="not-confident-btn" style={{background: 'rgba(30,41,59,0.8)', color: 'white'}} onClick={() => handleManualSelection('Intermediate')}>Intermediate (Band 6.5-7)</button>
              <button className="not-confident-btn" style={{background: 'rgba(30,41,59,0.8)', color: 'white'}} onClick={() => handleManualSelection('Advanced')}>Advanced (Band 7.5+)</button>
            </div>
            <button className="not-confident-btn" onClick={() => setAppState('diagnostic')}><BrainCircuit size={20} /> Not sure? Take Diagnostic Test</button>
          </motion.div>
        )}

        {appState === 'diagnostic' && (
          <motion.div key="diagnostic" className="diagnostic-center glass-panel" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <h4 className="text-cyan-400 font-bold">{DIAGNOSTIC_QUESTIONS[quizStep].type} (Q{quizStep + 1}/6)</h4>
            <p className="quiz-question">{DIAGNOSTIC_QUESTIONS[quizStep].text}</p>
            <div className="quiz-options">
              {DIAGNOSTIC_QUESTIONS[quizStep].options.map((opt, idx) => (
                <button key={idx} className="quiz-opt-btn" onClick={() => handleQuizAnswer(idx)}>{opt}</button>
              ))}
            </div>
          </motion.div>
        )}

        {appState === 'analyzing' && (
          <motion.div key="analyzing" className="analyzing-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BrainCircuit className="spinning-loader text-cyan-400" size={80} />
            <h2 style={{ fontSize: '2rem', marginTop: '20px' }}>Gemini AI is generating your 30-Day Plan...</h2>
          </motion.div>
        )}

        {appState === 'dashboard' && (
          <motion.div key="dashboard" className="hub-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="hub-tabs">
              <button className={activeTab === 'plan' ? 'active' : ''} onClick={() => setActiveTab('plan')}><Calendar size={18}/> 30-Day Plan</button>
              <button className={activeTab === 'syllabus' ? 'active' : ''} onClick={() => setActiveTab('syllabus')}><List size={18}/> Syllabus To-Do List</button>
              <button className={activeTab === 'resources' ? 'active' : ''} onClick={() => setActiveTab('resources')}><BookOpen size={18}/> Books & Channels</button>
            </div>

            {activeTab === 'plan' && (
              <div className="plan-grid">
                <div className="level-indicator">Level: <span style={{color: '#06b6d4', fontWeight: 'bold'}}>{userLevel}</span></div>
                <div className="thirty-day-scroll">
                  {customPlan.map((day, index) => (
                    <div key={index} className="day-card glass-panel">
                      <div className="day-header">
                        <h4>Day {day.day}</h4>
                        <h3>{day.title}</h3>
                      </div>
                      <ul className="day-tasks">
                        {day.tasks.map((task: string, i: number) => <li key={i}><CheckCircle size={14} className="text-cyan-400"/> {task}</li>)}
                      </ul>
                      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(day.searchQuery)}`} target="_blank" rel="noreferrer" className="youtube-search-btn">
                        <Youtube size={16} /> Watch Tutorial on YouTube
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div className="syllabus-grid">
                {Object.entries(SYLLABUS_ITEMS).map(([module, items]) => (
                  <div key={module} className="glass-panel" style={{marginBottom: '20px'}}>
                    <h3 style={{color: '#06b6d4', textTransform: 'uppercase', marginBottom: '15px'}}>{module}</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                      {items.map(item => {
                        const isDone = completedItems.includes(item);
                        return (
                          <div key={item} onClick={() => toggleItem(item)} style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: isDone ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px'}}>
                            <div style={{width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isDone ? '#22c55e' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                              {isDone && <CheckCircle size={14} color="#22c55e" />}
                            </div>
                            <span style={{textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#64748b' : 'white'}}>{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'resources' && (
               <div className="resources-grid">
               <div className="resource-col">
                 <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '20px' }}><ShoppingCart size={20} color="#06b6d4" style={{marginRight:'10px', display:'inline'}}/> Top Books</h3>
                 {RECOMMENDED_BOOKS.map(book => (
                   <div key={book.id} className="resource-card glass-panel" style={{ marginBottom: '15px' }}>
                     <h4>{book.title}</h4>
                     <p style={{ color: '#94a3b8', fontSize:'0.9rem', margin: '5px 0 10px 0' }}>{book.desc}</p>
                     <a href={book.link} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>Purchase Book <ExternalLink size={14} style={{display:'inline'}}/></a>
                   </div>
                 ))}
               </div>
               <div className="resource-col">
                 <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '20px' }}><Youtube size={20} color="#ef4444" style={{marginRight:'10px', display:'inline'}}/> Top Channels</h3>
                 {RECOMMENDED_CHANNELS.map(channel => (
                   <div key={channel.id} className="resource-card glass-panel" style={{ marginBottom: '15px' }}>
                     <h4>{channel.name}</h4>
                     <p style={{ color: '#94a3b8', fontSize:'0.9rem', margin: '5px 0 10px 0' }}>{channel.desc}</p>
                     <a href={channel.link} target="_blank" rel="noreferrer" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold' }}>Visit Channel <ExternalLink size={14} style={{display:'inline'}}/></a>
                   </div>
                 ))}
               </div>
             </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreparationScreen;