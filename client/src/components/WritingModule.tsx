import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenTool, AlertCircle } from 'lucide-react';
import Timer from './Timer';
import axios from 'axios';
import './WritingModule.css';

interface WritingModuleProps {
  testId?: string;
  onComplete: (results: any) => void;
}

const WritingModule: React.FC<WritingModuleProps> = ({ testId, onComplete }) => {
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTask, setCurrentTask] = useState<1 | 2>(1);
  const [responses, setResponses] = useState({ task1: '', task2: '' });

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const url = testId 
          ? `http://localhost:5000/api/writing/${testId}` 
          : 'http://localhost:5000/api/writing';
          
        const res = await axios.get(url);
        const testData = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!testData) throw new Error('No writing test found');
        setTest(testData);
      } catch (err: any) {
        setError(err.message || 'Failed to load writing test');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const getWordCount = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleSubmit = () => {
    onComplete({
      task1Score: 0, task2Score: 0,
      task1Response: responses.task1, task2Response: responses.task2,
      timeSpent: 3600
    });
  };

  if (loading) return <div className="flex justify-center py-20 text-pink-600"><div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !test) return <div className="text-center text-red-600 py-20"><AlertCircle size={48} className="mx-auto mb-4" /><p>{error}</p></div>;

  const task = test[`task${currentTask}`];
  const wordCount = getWordCount(responses[`task${currentTask}` as 'task1' | 'task2']);
  const minWords = currentTask === 1 ? 150 : 250;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3"><PenTool size={28} /><h2 className="text-2xl font-bold">{test.title}</h2></div>
          <Timer initialSeconds={3600} onTimeUp={handleSubmit} />
        </div>

        <div className="flex border-b border-slate-200">
          <button onClick={() => setCurrentTask(1)} className={`flex-1 py-4 font-bold ${currentTask === 1 ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600' : 'text-slate-500 hover:bg-slate-50'}`}>Task 1 (20 mins)</button>
          <button onClick={() => setCurrentTask(2)} className={`flex-1 py-4 font-bold ${currentTask === 2 ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600' : 'text-slate-500 hover:bg-slate-50'}`}>Task 2 (40 mins)</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-300px)]">
          <div className="p-8 border-r border-slate-200 overflow-y-auto bg-slate-50">
            <h3 className="text-xl font-bold mb-4">Prompt</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{task.prompt}</p>
            {task.imageUrl && <img src={task.imageUrl.startsWith('http') ? task.imageUrl : `http://localhost:5000${task.imageUrl}`} alt="Task 1 Graphic" className="mt-6 max-w-full rounded-lg shadow-md border border-slate-200" />}
          </div>

          <div className="p-8 flex flex-col bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Your Response</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${wordCount >= minWords ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>Words: {wordCount} / {minWords}</span>
            </div>
            <textarea
              className="flex-1 w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 resize-none font-sans text-lg leading-relaxed shadow-inner"
              placeholder="Start typing your essay here..."
              value={responses[`task${currentTask}` as 'task1' | 'task2']}
              onChange={(e) => setResponses({...responses, [`task${currentTask}`]: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex justify-end border-t border-slate-200">
          <button onClick={handleSubmit} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200">Submit Writing Test</button>
        </div>
      </div>
    </motion.div>
  );
};

export default WritingModule;