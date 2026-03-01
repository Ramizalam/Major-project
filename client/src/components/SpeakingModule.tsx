import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Clock, MessageSquare, User, Volume2, Play, Pause, StopCircle, Speaker } from 'lucide-react';

interface SpeakingModuleProps {
  onComplete: (results: {
    part1Score: number;
    part2Score: number;
    part3Score: number;
    responses: Array<{ transcript: string; audioUrl: string; evaluation: any }>;
    timeSpent: number;
    evaluation?: any;
  }) => void;
}

interface SpeakingPart {
  title: string;
  duration: string;
  description: string;
  questions: string[];
}

const SpeakingModule: React.FC<SpeakingModuleProps> = ({ onComplete }) => {
  const [currentPart, setCurrentPart] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Array<{ transcript: string; audioUrl: string; evaluation: any }>>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [speakingParts, setSpeakingParts] = useState<SpeakingPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuestionPlaying, setIsQuestionPlaying] = useState(false);

  // Fetch speaking test data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/speaking`);
        if (!res.ok) throw new Error('Failed to load speaking test');
        const data = await res.json();
        setSpeakingParts(data.parts || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load speaking test');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-play question when it changes
  useEffect(() => {
    if (speakingParts.length > 0 && currentPart > 0 && currentQuestion >= 0) {
      const currentPartData = speakingParts[currentPart - 1];
      if (currentPartData && currentPartData.questions[currentQuestion]) {
        // Small delay before playing question
        setTimeout(() => {
          playQuestion(currentPartData.questions[currentQuestion]);
        }, 500);
      }
    }
  }, [currentPart, currentQuestion, speakingParts]);

  const playQuestion = (questionText: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(questionText);

      // Configure voice settings
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-GB'; // British English (IELTS standard)

      // Try to use a British English voice if available
      const voices = window.speechSynthesis.getVoices();
      const britishVoice = voices.find(voice =>
        voice.lang === 'en-GB' || voice.name.includes('British') || voice.name.includes('UK')
      );
      if (britishVoice) {
        utterance.voice = britishVoice;
      }

      utterance.onstart = () => setIsQuestionPlaying(true);
      utterance.onend = () => setIsQuestionPlaying(false);
      utterance.onerror = () => setIsQuestionPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleResponseComplete = async (responseData: { transcript: string; audioUrl: string }) => {
    try {
      const evalRes = await fetch('http://localhost:5000/api/speaking/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: responseData.transcript,
          partNumber: currentPart,
          questionIndex: currentQuestion
        })
      });
      const json = await evalRes.json();
      // Server returns { success: true, evaluation }
      const evaluation = json && json.evaluation ? json.evaluation : json;

      const newResponses = [...responses, { ...responseData, evaluation }];
      setResponses(newResponses);

      const currentPartData = speakingParts[currentPart - 1];
      if (currentQuestion < currentPartData.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentPart < 3) {
        setCurrentPart(currentPart + 1);
        setCurrentQuestion(0);
      } else {
        completeTest(newResponses);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      alert('Failed to evaluate response. Please try again.');
    }
  };

  const completeTest = (allResponses: any[]) => {
    const part1Responses = allResponses.slice(0, speakingParts[0]?.questions.length || 5);
    const part2Responses = allResponses.slice(
      speakingParts[0]?.questions.length || 5,
      (speakingParts[0]?.questions.length || 5) + (speakingParts[1]?.questions.length || 1)
    );
    const part3Responses = allResponses.slice((speakingParts[0]?.questions.length || 5) + (speakingParts[1]?.questions.length || 1));

    const avgScore = (responses: any[]) => {
      if (responses.length === 0) return 5.0;
      const sum = responses.reduce((acc, r) => acc + (r.evaluation?.overallBand || 5.0), 0);
      return sum / responses.length;
    };

    // Aggregate evaluations across all responses to produce a top-level speaking evaluation
    const evals = allResponses.map(r => r.evaluation).filter(Boolean);
    const aggregateMetric = (key: string, fallback = 5.0) => {
      const vals = evals.map((e: any) => (typeof e[key] === 'number' ? e[key] : fallback));
      if (vals.length === 0) return fallback;
      return vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
    };

    const speakingEvaluation = {
      overallBand: parseFloat((aggregateMetric('overallBand', 5.0)).toFixed(1)),
      fluency: parseFloat((aggregateMetric('fluency', 5.0)).toFixed(1)),
      vocabulary: parseFloat((aggregateMetric('vocabulary', 5.0)).toFixed(1)),
      grammar: parseFloat((aggregateMetric('grammar', 5.0)).toFixed(1)),
      pronunciation: parseFloat((aggregateMetric('pronunciation', 5.0)).toFixed(1)),
      fillerWordsFound: evals.reduce((acc: number, e: any) => acc + (e.fillerWordsFound || 0), 0),
      wordCount: evals.reduce((acc: number, e: any) => acc + (e.wordCount || 0), 0),
      sentenceCount: evals.reduce((acc: number, e: any) => acc + (e.sentenceCount || 0), 0),
      recommendations: evals.flatMap((e: any) => e.recommendations || [])
    };

    onComplete({
      part1Score: avgScore(part1Responses),
      part2Score: avgScore(part2Responses),
      part3Score: avgScore(part3Responses),
      responses: allResponses,
      timeSpent,
      evaluation: speakingEvaluation
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading speaking test...</div>;
  }

  if (speakingParts.length === 0) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error || 'Failed to load test'}</div>;
  }

  const currentPartData = speakingParts[currentPart - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mic className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">IELTS Speaking Test</h1>
                <p className="text-gray-600">3 parts • 11-14 minutes total • Two-way interview</p>
              </div>
            </div>
            <div className="text-right bg-blue-50 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Time elapsed</div>
            </div>
          </div>
        </div>

        {/* Examiner Introduction */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">🎙️ AI Examiner (Speaking)</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Good morning/afternoon. I'm your IELTS examiner today. This speaking test will take
                about 11-14 minutes. I will ask you questions and you should answer as fully as possible.
                Please listen carefully when I speak.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-blue-900 font-semibold">
                  Current: {currentPartData.title}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  {currentPartData.duration} • {currentPartData.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Question with Audio */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="relative">
              {isQuestionPlaying && (
                <div className="absolute -inset-1 bg-green-400 rounded-full animate-ping"></div>
              )}
              <div className={`${isQuestionPlaying ? 'bg-green-200' : 'bg-indigo-100'} p-3 rounded-full relative`}>
                <MessageSquare className={`w-6 h-6 ${isQuestionPlaying ? 'text-green-700' : 'text-indigo-600'}`} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">
                  Question {responses.length + 1}
                </h3>
                <button
                  onClick={() => playQuestion(currentPartData.questions[currentQuestion])}
                  className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  disabled={isQuestionPlaying}
                >
                  <Speaker className="w-4 h-4" />
                  <span>{isQuestionPlaying ? 'Speaking...' : 'Repeat Question'}</span>
                </button>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 relative">
                {isQuestionPlaying && (
                  <div className="absolute top-3 right-3">
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
                  {currentPartData.questions[currentQuestion]}
                </p>
              </div>

              {currentPart === 2 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-yellow-900 text-sm font-medium">
                    ⏱️ Preparation Time: 1 minute • Speaking Time: 1-2 minutes
                  </p>
                </div>
              )}

              {isQuestionPlaying && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    🎧 Listen carefully to the examiner's question...
                  </p>
                </div>
              )}
            </div>
          </div>

          <SpeakingRecorder
            onComplete={handleResponseComplete}
            isLongTurn={currentPart === 2}
            questionNumber={responses.length + 1}
            isQuestionPlaying={isQuestionPlaying}
          />
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Test Progress</h4>
            <span className="text-sm text-gray-500">
              Part {currentPart}/3 • Question {currentQuestion + 1}/{currentPartData.questions.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {speakingParts.map((part, index) => {
              const partNum = index + 1;
              const isActive = partNum === currentPart;
              const isCompleted = partNum < currentPart;

              return (
                <div
                  key={partNum}
                  className={`p-4 rounded-lg text-center transition-all ${isActive ? 'bg-blue-100 border-2 border-blue-400 shadow-md' :
                    isCompleted ? 'bg-green-100 border-2 border-green-400' :
                      'bg-gray-100 border-2 border-gray-200'
                    }`}
                >
                  <div className={`font-bold text-lg ${isActive ? 'text-blue-800' :
                    isCompleted ? 'text-green-800' :
                      'text-gray-600'
                    }`}>
                    Part {partNum}
                  </div>
                  <div className={`text-xs mt-1 ${isActive ? 'text-blue-600' :
                    isCompleted ? 'text-green-600' :
                      'text-gray-500'
                    }`}>
                    {part.duration}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Voice Recording Component
interface SpeakingRecorderProps {
  onComplete: (data: { transcript: string; audioUrl: string }) => void;
  isLongTurn: boolean;
  questionNumber: number;
  isQuestionPlaying: boolean;
}

const SpeakingRecorder: React.FC<SpeakingRecorderProps> = ({
  onComplete,
  isLongTurn,
  questionNumber,
  isQuestionPlaying
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(isLongTurn);
  const [preparationTime, setPreparationTime] = useState(isLongTurn ? 60 : 0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);

  // Preparation timer
  useEffect(() => {
    if (isPreparing && preparationTime > 0) {
      const timer = setTimeout(() => setPreparationTime(preparationTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [preparationTime, isPreparing]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isRecording]);

  // Reset audio ref when question changes
  useEffect(() => {
    return () => {
      if (recordingAudioRef.current) {
        recordingAudioRef.current.pause();
        recordingAudioRef.current = null;
      }
      setIsPlayingRecording(false);
    };
  }, [questionNumber]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = () => {
    if (!transcript.trim()) {
      alert('Please record your response first!');
      return;
    }

    onComplete({
      transcript: transcript.trim(),
      audioUrl: audioUrl
    });

    // Reset for next question
    setTranscript('');
    setAudioUrl('');
    setRecordingTime(0);
    setIsPreparing(isLongTurn);
    setPreparationTime(isLongTurn ? 60 : 0);
    if (recordingAudioRef.current) {
      recordingAudioRef.current.pause();
      recordingAudioRef.current = null;
    }
    setIsPlayingRecording(false);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!recordingAudioRef.current) {
      recordingAudioRef.current = new Audio(audioUrl);
      recordingAudioRef.current.onended = () => setIsPlayingRecording(false);
    }

    if (isPlayingRecording) {
      recordingAudioRef.current.pause();
      setIsPlayingRecording(false);
    } else {
      recordingAudioRef.current.play();
      setIsPlayingRecording(true);
    }
  };

  // Preparation Phase
  if (isPreparing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-300">
          <h4 className="font-semibold text-yellow-900">📝 Preparation Time</h4>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-2xl text-yellow-600">{preparationTime}s</span>
          </div>
        </div>

        <textarea
          placeholder="Make notes for your response (optional)..."
          className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />

        <button
          onClick={() => {
            setIsPreparing(false);
            startRecording();
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
        >
          Start Speaking →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center space-x-3 bg-red-50 p-4 rounded-lg border-2 border-red-300 animate-pulse">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          <Volume2 className="w-5 h-5 text-red-600" />
          <span className="text-red-700 font-semibold">Recording... {recordingTime}s</span>
        </div>
      )}

      {/* Disable recording while question is playing */}
      {isQuestionPlaying && !isRecording && (
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
          <p className="text-blue-700 font-medium">
            🎧 Please wait for the examiner to finish speaking...
          </p>
        </div>
      )}

      {/* Transcript Display */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 min-h-[120px]">
        <p className="text-sm text-gray-500 mb-2">Live Transcript:</p>
        <p className="text-gray-800 leading-relaxed">
          {transcript || 'Your speech will appear here...'}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Words: {transcript.trim().split(/\s+/).filter(w => w).length}
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isQuestionPlaying}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <Mic className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <StopCircle className="w-5 h-5" />
            <span>Stop Recording</span>
          </button>
        )}

        {audioUrl && !isRecording && (
          <button
            onClick={togglePlayback}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center space-x-2"
          >
            {isPlayingRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isPlayingRecording ? 'Pause' : 'Play'}</span>
          </button>
        )}
      </div>

      {/* Submit Button */}
      {!isRecording && transcript && (
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
        >
          Submit & Next Question →
        </button>
      )}
    </div>
  );
};

export default SpeakingModule;
