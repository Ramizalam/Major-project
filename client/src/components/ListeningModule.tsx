import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Headphones, AlertCircle, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface ListeningModuleProps {
  testId?: string;
  onComplete: (results: { score: number; answers: (string | number)[]; timeSpent: number }) => void;
}

const ListeningModule: React.FC<ListeningModuleProps> = ({ testId, onComplete }) => {
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const url = testId 
          ? `http://localhost:5000/api/listening/${testId}` 
          : 'http://localhost:5000/api/listening';
          
        const res = await axios.get(url);
        const testData = Array.isArray(res.data) ? res.data[0] : res.data;
        
        if (!testData) throw new Error('No listening test found');
        setTest(testData);
      } catch (err: any) {
        console.error('Error fetching test:', err);
        setError(err.message || 'Failed to load listening test');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const submitTest = () => {
    if (!test) return;
    let score = 0;
    const finalAnswers: string[] = [];

    test.sections.forEach((section: any) => {
      section.questions.forEach((q: any) => {
        const userAnswer = (answers[q._id] || '').trim().toLowerCase();
        finalAnswers.push(userAnswer);
        if (userAnswer === q.correctAnswer.trim().toLowerCase()) score++;
      });
    });

    onComplete({ score, answers: finalAnswers, timeSpent: 1800 });
  };

  if (loading) return <div className="flex justify-center py-20 text-indigo-600"><div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !test) return <div className="text-center text-red-600 py-20"><AlertCircle size={48} className="mx-auto mb-4" /><p>{error}</p></div>;

  const section = test.sections[currentSection];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3"><Headphones size={28} /><h2 className="text-2xl font-bold">{test.title} - Section {currentSection + 1}</h2></div>
        </div>

        <div className="p-8 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Section {currentSection + 1} Audio</h3>
              <p className="text-slate-500 text-sm">You will hear the recording only once.</p>
            </div>
            <button onClick={togglePlay} className="flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition shadow-lg">
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            <audio 
              ref={audioRef} 
              src={section.audioUrl.startsWith('http') ? section.audioUrl : `http://localhost:5000${section.audioUrl}`} 
              onEnded={() => setIsPlaying(false)} 
              className="hidden" 
            />
          </div>
        </div>

        <div className="p-8 space-y-6 bg-white h-[50vh] overflow-y-auto">
          {section.questions.map((q: any) => (
            <div key={q._id} className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-medium text-slate-800 mb-4"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold mr-3">{q.number || '?'}</span>{q.text}</p>
              {q.type === 'multiple_choice' ? (
                <div className="space-y-3 ml-11">
                  {q.options?.map((opt: string, i: number) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" name={q._id} value={opt} checked={answers[q._id] === opt} onChange={(e) => setAnswers({...answers, [q._id]: e.target.value})} className="mt-1 text-purple-600" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="ml-11">
                  <input type="text" value={answers[q._id] || ''} onChange={(e) => setAnswers({...answers, [q._id]: e.target.value})} placeholder="Type answer..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-between">
          <button onClick={() => {setCurrentSection(c => Math.max(0, c - 1)); setIsPlaying(false);}} disabled={currentSection === 0} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${currentSection === 0 ? 'bg-slate-200 text-slate-400' : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'}`}><ChevronLeft size={20} /> Previous</button>
          {currentSection === test.sections.length - 1 ? (
            <button onClick={submitTest} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg">Submit Test</button>
          ) : (
            <button onClick={() => {setCurrentSection(c => Math.min(test.sections.length - 1, c + 1)); setIsPlaying(false);}} className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg">Next <ChevronRight size={20} /></button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListeningModule;