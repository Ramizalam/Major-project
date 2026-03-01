import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ListeningModule from './components/ListeningModule';
import ReadingModule from './components/ReadingModule';
import WritingModule from './components/WritingModule';
import SpeakingModule from './components/SpeakingModule';
import ResultsScreen from './components/ResultsScreen';

export interface WritingFeedback {
  taskAchievement?: { score: number; feedback: string };
  coherenceAndCohesion?: { score: number; feedback: string };
  lexicalResource?: { score: number; feedback: string };
  grammaticalRange?: { score: number; feedback: string };
  overallBand?: number;
  areasForImprovement?: string[];
  strengths?: string[];
  recommendations?: string[];
  wordCount?: number;
  taskType?: string;
}

export interface SpeakingEvaluation {
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overallBand: number;
  wordCount: number;
  sentenceCount: number;
  fillerWordsFound: number;
  fillerRatio: number;
  recommendations: string[];
  performanceLevel: string;
  partNumber?: number;
}

export interface TestResults {
  listening: { score: number; answers: (string | number)[]; timeSpent: number };
  reading: { score: number; answers: (string | number)[]; timeSpent: number };
  writing: {
    task1Score: number;
    task2Score: number;
    task1Response: string;
    task2Response: string;
    timeSpent: number;
    feedback?: { task1?: WritingFeedback; task2?: WritingFeedback };
  };
  speaking: {
    part1Score: number;
    part2Score: number;
    part3Score: number;
    responses: string[];
    timeSpent: number;
    evaluation?: SpeakingEvaluation;
  };
}

import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function AppContent() {
  const [currentModule, setCurrentModule] = useState<'welcome' | 'listening' | 'reading' | 'writing' | 'speaking' | 'results' | 'admin'>('welcome');
  const [testResults, setTestResults] = useState<Partial<TestResults>>({});
  const [testMode, setTestMode] = useState<'full' | 'single'>('full');

  const { isAdmin } = useAuth();

  const handleModuleComplete = (module: keyof TestResults, results: any) => {
    setTestResults(prev => ({ ...prev, [module]: results }));

    // If in single section mode, go straight to results
    if (testMode === 'single') {
      setCurrentModule('results');
      return;
    }

    // Navigate to next module
    const moduleOrder = ['listening', 'reading', 'writing', 'speaking'];
    const currentIndex = moduleOrder.indexOf(module);

    if (currentIndex < moduleOrder.length - 1) {
      setCurrentModule(moduleOrder[currentIndex + 1] as any);
    } else {
      setCurrentModule('results');
    }
  };

  const startTest = (module?: 'listening' | 'reading' | 'writing' | 'speaking') => {
    if (module) {
      setTestMode('single');
      setCurrentModule(module);
    } else {
      setTestMode('full');
      setCurrentModule('listening');
    }
  };

  const resetTest = () => {
    setCurrentModule('welcome');
    setTestResults({});
    setTestMode('full');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentModule === 'welcome' && (
        <WelcomeScreen onStart={startTest} />
      )}

      {currentModule === 'listening' && (
        <ListeningModule onComplete={(results) => handleModuleComplete('listening', results)} />
      )}

      {currentModule === 'reading' && (
        <ReadingModule onComplete={(results) => handleModuleComplete('reading', results)} />
      )}

      {currentModule === 'writing' && (
        <WritingModule onComplete={(results) => handleModuleComplete('writing', results)} />
      )}

      {currentModule === 'speaking' && (
        <SpeakingModule onComplete={(results) => handleModuleComplete('speaking', results)} />
      )}

      {currentModule === 'results' && (
        <ResultsScreen results={testResults as TestResults} onReset={resetTest} />
      )}
      {currentModule === 'admin' && !isAdmin && (
        <AdminLogin
          onLoginSuccess={() => setCurrentModule('admin')}
          onCancel={() => setCurrentModule('welcome')}
        />
      )}

      {currentModule === 'admin' && isAdmin && (
        <AdminDashboard onLogout={() => setCurrentModule('welcome')} />
      )}
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;