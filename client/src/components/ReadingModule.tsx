import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import Timer from './Timer';

interface ReadingModuleProps {
  onComplete: (results: { score: number; answers: (string | number)[]; timeSpent: number }) => void;
}

const ReadingModule: React.FC<ReadingModuleProps> = ({ onComplete }) => {
  const [currentPassage, setCurrentPassage] = useState(1);
  const [answers, setAnswers] = useState<(string | number)[]>(Array(40).fill(''));
  const [timeSpent, setTimeSpent] = useState(0);
  const [readingTest, setReadingTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/api/reading`);
        if (!response.ok) throw new Error('Failed to load reading test');
        const data = await response.json();
        setReadingTest(data);
      } catch (err: any) {
        console.error('Error fetching reading test:', err);
        setError(err.message || 'Failed to load reading test');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
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

  const calculateScore = () => {
    if (!readingTest || !readingTest.correctAnswers) return 0;
    let correct = 0;
    answers.forEach((answer, index) => {
      const userAnswer = typeof answer === 'string' ? answer.toString().toLowerCase().trim() : answer.toString();
      const correctAnswerItem = readingTest.correctAnswers[index];
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

  const getQuestionStartIndex = (passageNum: number) => {
    if (passageNum === 1) return 0;
    if (passageNum === 2) return 10;
    return 25;
  };

  const renderQuestions = (passageNum: number) => {
    if (!readingTest || !readingTest.passages || readingTest.passages.length < passageNum) return null;
    const startIndex = getQuestionStartIndex(passageNum);
    const questionsCount = readingTest.passages[passageNum - 1].questions;
    const endIndex = startIndex + questionsCount;
    const questions = [];

    for (let i = startIndex; i < endIndex; i++) {
      const questionNum = i + 1;
      questions.push(
        <div key={i} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {questionNum}. {getQuestionText(i, passageNum)}
          </label>
          {getQuestionInput(i, questionNum, passageNum)}
        </div>
      );
    }
    return questions;
  };

  const getQuestionText = (index: number, passageNum: number) => {
    if (!readingTest || !readingTest.questionTexts || !readingTest.questionTexts[passageNum]) {
      return `Question ${index + 1}`;
    }
    const passageQuestions = readingTest.questionTexts[passageNum];
    const questionIndex = index - getQuestionStartIndex(passageNum);
    return passageQuestions[questionIndex] || `Question ${index + 1}`;
  };

  const getQuestionInput = (index: number, questionNum: number, passageNum: number) => {
    const questionIndex = index - getQuestionStartIndex(passageNum);

    let options = null;
    if (readingTest && readingTest.questionOptions && readingTest.questionOptions[passageNum]) {
      const passageOptions = readingTest.questionOptions[passageNum];
      if (passageOptions && passageOptions[questionIndex]) {
        options = passageOptions[questionIndex];
      }
    }

    const defaultOptions = ['A', 'B', 'C', 'D'];
    const displayOptions = (options && Array.isArray(options) && options.length > 0) ? options : defaultOptions;

    return (
      <div className="space-y-2">
        {displayOptions.map((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex);
          const isDefault = displayOptions === defaultOptions;
          return (
            <label key={letter} className="flex items-center">
              <input
                type="radio"
                name={`q${questionNum}`}
                value={letter}
                checked={answers[index] === letter}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{isDefault ? option : `${letter}) ${option}`}</span>
            </label>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">Loading reading test...</div>;
  }

  if (error || !readingTest) {
    return <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center text-red-600">{error || "Failed to load test"}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">IELTS Reading Test</h1>
                <p className="text-gray-600">40 questions • 60 minutes</p>
              </div>
            </div>
            <Timer duration={60 * 60} onTimeUp={handleSubmit} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Passage */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Passage {currentPassage}: {readingTest.passages[currentPassage - 1]?.title}
              </h2>
              <div className="flex space-x-2">
                {readingTest.passages.map((_: any, idx: number) => {
                  const num = idx + 1;
                  return (
                    <button
                      key={num}
                      onClick={() => setCurrentPassage(num)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${currentPassage === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="prose max-w-none text-gray-700 leading-relaxed">
              {readingTest.passages[currentPassage - 1]?.text?.split('\n\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-6">
              Questions for Passage {currentPassage}
            </h3>
            <div className="space-y-4 max-h-[927px] overflow-y-auto">
              {renderQuestions(currentPassage)}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Complete Reading Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingModule;