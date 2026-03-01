import React, { useState, useEffect } from 'react';
import { Headphones, Play, Pause, Volume2 } from 'lucide-react';
import Timer from './Timer';

interface ListeningModuleProps {
  onComplete: (results: { score: number; answers: (string | number)[]; timeSpent: number }) => void;
}

const ListeningModule: React.FC<ListeningModuleProps> = ({ onComplete }) => {
  const [currentSection, setCurrentSection] = useState(1);
  const [answers, setAnswers] = useState<(string | number)[]>(Array(40).fill(''));
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listeningTest, setListeningTest] = useState<any>(null);

  // Fetch test data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/listening`);
        if (!res.ok) throw new Error(`Failed to load listening data (${res.status})`);
        const data = await res.json();
        setListeningTest(data);
      } catch (e: any) {
        setError(e.message || 'Error fetching listening data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAnswerChange = (questionIndex: number, value: string | number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const toggleAudio = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const getAudioSource = () => {
    const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
    switch (currentSection) {
      case 1:
        return `${baseUrl}/public/Librarian audio.mp3`;
      case 2:
        return `${baseUrl}/public/museum audio.mp3`;
      case 3:
        return `${baseUrl}/public/Research project.mp3`;
      case 4:
        return `${baseUrl}/public/Lecture audio.mp3`;
      default:
        return `${baseUrl}/public/Librarian audio.mp3`;
    }
  };

  const getAudioLabel = () => {
    switch (currentSection) {
      case 1:
        return 'Library Audio';
      case 2:
        return 'Museum Audio';
      case 3:
        return 'Research Project Audio';
      case 4:
        return 'Lecture Audio';
      default:
        return 'Library Audio';
    }
  };

  const calculateScore = () => {
    if (!listeningTest || !listeningTest.correctAnswers) return 0;
    let correct = 0;
    answers.forEach((answer, index) => {
      const userAnswer = typeof answer === 'string' ? answer.toLowerCase().trim() : answer.toString();
      const correctAnswerItem = listeningTest.correctAnswers[index];
      const correctAnswer = correctAnswerItem ? correctAnswerItem.toString().toLowerCase() : '';

      if (userAnswer === correctAnswer && correctAnswer !== '') {
        correct++;
      }
    });
    return correct;
  };

  const convertToIELTSBand = (rawScore: number) => {
    const bandTable = {
      39: 9.0, 37: 8.5, 35: 8.0, 32: 7.5, 30: 7.0,
      26: 6.5, 23: 6.0, 18: 5.5, 16: 5.0, 13: 4.5,
      10: 4.0, 8: 3.5, 6: 3.0, 4: 2.5, 3: 2.0
    };

    for (const [score, band] of Object.entries(bandTable)) {
      if (rawScore >= parseInt(score)) {
        return band;
      }
    }
    return 1.0;
  };

  const handleSubmit = () => {
    const rawScore = calculateScore();
    const bandScore = convertToIELTSBand(rawScore);
    onComplete({ score: bandScore, answers, timeSpent });
  };

  const renderQuestions = (startIndex: number, endIndex: number) => {
    const questions = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const questionNum = i + 1;
      questions.push(
        <div key={i} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {questionNum}. {getQuestionText(i)}
          </label>
          {getQuestionInput(i, questionNum)}
        </div>
      );
    }
    return questions;
  };

  const getQuestionText = (index: number) => {
    if (!listeningTest || !listeningTest.questionTexts) return `Question ${index + 1} - Complete the notes`;
    let sectionNum = 1;
    if (index >= 10 && index < 20) sectionNum = 2;
    else if (index >= 20 && index < 30) sectionNum = 3;
    else if (index >= 30 && index < 40) sectionNum = 4;

    if (listeningTest.questionTexts[sectionNum]) {
      const questionIndex = index % 10;
      return listeningTest.questionTexts[sectionNum][questionIndex] || `Question ${index + 1} - Complete the notes`;
    }
    return `Question ${index + 1} - Complete the notes`;
  };

  const getQuestionInput = (index: number, questionNum: number) => {
    let sectionNum = 1;
    if (index >= 10 && index < 20) sectionNum = 2;
    else if (index >= 20 && index < 30) sectionNum = 3;
    else if (index >= 30 && index < 40) sectionNum = 4;

    const questionIndex = index % 10;

    let options = null;
    if (listeningTest && listeningTest.questionOptions && listeningTest.questionOptions[sectionNum]) {
      const sectionOptions = listeningTest.questionOptions[sectionNum];
      if (sectionOptions && sectionOptions[questionIndex]) {
        options = sectionOptions[questionIndex];
      }
    }

    if (options && Array.isArray(options) && options.length > 0) {
      return (
        <div className="space-y-2">
          {options.map((option, optionIndex) => {
            const letter = String.fromCharCode(65 + optionIndex);
            return (
              <label key={letter} className="flex items-center">
                <input
                  type="radio"
                  name={`q${questionNum}`}
                  value={letter}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">{letter}) {option}</span>
              </label>
            );
          })}
        </div>
      );
    }

    return (
      <input
        type="text"
        value={answers[index]}
        onChange={(e) => handleAnswerChange(index, e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your answer"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Headphones className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">IELTS Listening Test</h1>
                <p className="text-gray-600">40 questions • 30 minutes + 10 minutes transfer time</p>
              </div>
            </div>
            <Timer duration={40 * 60} onTimeUp={handleSubmit} />
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">Loading listening data...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
        )}

        {!loading && !error && listeningTest && listeningTest.sections && listeningTest.sections.length > 0 && (
          <>
            {/* Audio Player */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Audio Player</h3>
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-500">{getAudioLabel()}</span>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <audio
                  ref={setAudioRef}
                  onEnded={handleAudioEnded}
                  className="w-full mb-4"
                  controls
                  key={currentSection}
                >
                  <source src={getAudioSource()} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={toggleAudio}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play'} Audio</span>
                  </button>
                </div>
                <div className="mt-4 bg-blue-100 text-blue-800 text-sm p-3 rounded">
                  <p><strong>Note:</strong> In the actual IELTS test, audio will play automatically and cannot be paused or replayed.
                    This practice version allows you to control playback for learning purposes.</p>
                </div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Test Sections</h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setCurrentSection(num)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${currentSection === num
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Section {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800">{listeningTest.sections[currentSection - 1]?.title}</h4>
                <p className="text-blue-700 text-sm mt-1">{listeningTest.sections[currentSection - 1]?.description}</p>
                <p className="text-blue-600 text-sm mt-2">Questions: {listeningTest.sections[currentSection - 1]?.questions}</p>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-6">Section {currentSection} Questions</h3>
              {renderQuestions((currentSection - 1) * 10, currentSection * 10 - 1)}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Complete Listening Test
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListeningModule;