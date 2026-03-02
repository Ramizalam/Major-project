import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SelectionScreen from './components/SelectionScreen';
import AuthScreen from './components/AuthScreen';
import WelcomeScreen from './components/WelcomeScreen';
import ListeningModule from './components/ListeningModule';
import ReadingModule from './components/ReadingModule';
import WritingModule from './components/WritingModule';
import SpeakingModule from './components/SpeakingModule';
import ResultsScreen from './components/ResultsScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export interface WritingFeedback { taskAchievement?: { score: number; feedback: string }; coherenceAndCohesion?: { score: number; feedback: string }; lexicalResource?: { score: number; feedback: string }; grammaticalRange?: { score: number; feedback: string }; overallBand?: number; areasForImprovement?: string[]; strengths?: string[]; recommendations?: string[]; wordCount?: number; taskType?: string; }
export interface SpeakingEvaluation { fluency: number; vocabulary: number; grammar: number; pronunciation: number; overallBand: number; wordCount: number; sentenceCount: number; fillerWordsFound: number; fillerRatio: number; recommendations: string[]; performanceLevel: string; partNumber?: number; }
export interface TestResults { listening: { score: number; answers: (string | number)[]; timeSpent: number }; reading: { score: number; answers: (string | number)[]; timeSpent: number }; writing: { task1Score: number; task2Score: number; task1Response: string; task2Response: string; timeSpent: number; feedback?: { task1?: WritingFeedback; task2?: WritingFeedback }; }; speaking: { part1Score: number; part2Score: number; part3Score: number; responses: string[]; timeSpent: number; evaluation?: SpeakingEvaluation; }; }

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

function PracticeArea() {
  const [currentModule, setCurrentModule] = useState<'welcome' | 'listening' | 'reading' | 'writing' | 'speaking' | 'results' | 'admin'>('welcome');
  const [testResults, setTestResults] = useState<Partial<TestResults>>({});
  const [testMode, setTestMode] = useState<'full' | 'single'>('full');
  const { isAdmin } = useAuth();

  const handleModuleComplete = (module: keyof TestResults, results: any) => {
    setTestResults(prev => ({ ...prev, [module]: results }));
    if (testMode === 'single') return setCurrentModule('results');
    const moduleOrder = ['listening', 'reading', 'writing', 'speaking'];
    const currentIndex = moduleOrder.indexOf(module);
    if (currentIndex < moduleOrder.length - 1) setCurrentModule(moduleOrder[currentIndex + 1] as any);
    else setCurrentModule('results');
  };

  const startTest = (module?: 'listening' | 'reading' | 'writing' | 'speaking') => {
    if (module) { setTestMode('single'); setCurrentModule(module); } 
    else { setTestMode('full'); setCurrentModule('listening'); }
  };

  const resetTest = () => { setCurrentModule('welcome'); setTestResults({}); setTestMode('full'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentModule === 'welcome' && <WelcomeScreen onStart={startTest} />}
      {currentModule === 'listening' && <ListeningModule onComplete={(results) => handleModuleComplete('listening', results)} />}
      {currentModule === 'reading' && <ReadingModule onComplete={(results) => handleModuleComplete('reading', results)} />}
      {currentModule === 'writing' && <WritingModule onComplete={(results) => handleModuleComplete('writing', results)} />}
      {currentModule === 'speaking' && <SpeakingModule onComplete={(results) => handleModuleComplete('speaking', results)} />}
      {currentModule === 'results' && <ResultsScreen results={testResults as TestResults} onReset={resetTest} />}
      {currentModule === 'admin' && !isAdmin && <AdminLogin onLoginSuccess={() => setCurrentModule('admin')} onCancel={() => setCurrentModule('welcome')} />}
      {currentModule === 'admin' && isAdmin && <AdminDashboard onLogout={() => setCurrentModule('welcome')} />}
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/selection" element={<ProtectedRoute><SelectionScreen /></ProtectedRoute>} />
          <Route path="/preparation" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Preparation Module</h1>
                <p className="text-xl text-slate-400">Phase 3 Content Coming Soon</p>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={<ProtectedRoute><PracticeArea /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
export default App;