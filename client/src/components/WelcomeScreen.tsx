import React from 'react';
import { BookOpen, Clock, CheckCircle, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (section?: 'listening' | 'reading' | 'writing' | 'speaking') => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const heroImage =
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=';

  const moduleImages = {
    listening:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=',
    reading:
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=',
    writing:
      'data:image/webp;base64,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',
    speaking:
      'https://th.bing.com/th/id/R.85c9e1292eb7d52e64b136213a86789e?rik=lNwWgYTS%2f5jHcA&riu=http%3a%2f%2fwww.ssbcrack.com%2fwp-content%2fuploads%2f2016%2f11%2f5-Easy-Steps-to-Improve-Your-English-Speaking-Skills.jpg&ehk=DP7ZqgaGYUexjqagYg1Q68rtEiufwSP8kUxjW0Oo01A%3d&risl=&pid=ImgRaw&r=0',
  } as const;

  return (
    <div className="min-h-screen flex items-start justify-center p-6 md:p-10">
      <div className="w-full max-w-6xl mx-auto space-y-10">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <div
            className="h-[280px] md:h-[360px] w-full bg-center bg-cover"
            style={{ backgroundImage: `linear-gradient(rgba(3,7,18,0.55), rgba(3,7,18,0.45)), url(${heroImage})` }}
          />
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col items-start justify-end">
            <BookOpen className="w-12 h-12 text-white mb-3" />
            <h1 className="text-white text-3xl md:text-5xl font-extrabold tracking-tight">
              Master the IELTS with Confidence
            </h1>
            <p className="text-white/90 mt-3 md:text-lg max-w-2xl">
              Realistic exam simulation, professional timing, and insights to lift your band score.
            </p>
            <div className="mt-6">
              <button
                onClick={() => onStart()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 md:py-4 md:px-8 rounded-xl text-base md:text-lg transition-all duration-200 transform hover:translate-y-[-2px] shadow-lg shadow-blue-600/30"
              >
                Begin IELTS Test
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-7 md:p-10">
            <h3 className="text-2xl font-semibold text-gray-800 mb-5">Test Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Listening: 30 minutes + 10 minutes transfer</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Reading: 60 minutes</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Writing: 60 minutes (Task 1 & Task 2)</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Speaking: 11-14 minutes (3 parts)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-7 md:p-10">
            <h3 className="text-2xl font-semibold text-gray-800 mb-5">What You'll Get</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>Official IELTS band scores (0-9)</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>Detailed performance analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>Expert examiner feedback</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>Personalized study plan</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Or choose a section to practice:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                key: 'listening',
                label: 'Listening',
                img: moduleImages.listening,
              },
              {
                key: 'reading',
                label: 'Reading',
                img: moduleImages.reading,
              },
              {
                key: 'writing',
                label: 'Writing',
                img: moduleImages.writing,
              },
              {
                key: 'speaking',
                label: 'Speaking',
                img: moduleImages.speaking,
              },
            ].map(card => (
              <button
                key={card.key}
                className="group relative overflow-hidden rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => onStart(card.key as 'listening' | 'reading' | 'writing' | 'speaking')}
                aria-label={`Start ${card.label} section`}
                type="button"
              >
                <div
                  className="h-28 md:h-36 w-full bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `linear-gradient(rgba(3,7,18,0.3), rgba(3,7,18,0.3)), url(${card.img})` }}
                />
                <div className="absolute inset-0 flex items-end p-4">
                  <span className="bg-white/90 text-gray-900 text-sm md:text-base font-semibold px-3 py-1.5 rounded-lg shadow">
                    {card.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 flex gap-4 md:gap-6 items-start">
          <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-amber-900">Test Conditions</h4>
            <p className="text-amber-800 mt-1">
              This simulation follows official IELTS timing and format. Choose a quiet place and ensure a stable
              internet connection for the best experience.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => onStart()}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 md:py-4 md:px-8 rounded-xl text-base md:text-lg transition-all duration-200 transform hover:translate-y-[-2px] shadow-lg shadow-blue-600/30"
          >
            Start Full Test
          </button>
          <p className="text-sm text-gray-500 mt-3">Total time: ~2h 45m</p>
        </div>

        {/* Admin Access Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => onStart('admin' as any)}
            className="text-sm text-indigo-500 hover:text-indigo-700 font-medium flex items-center justify-center mx-auto transition-colors group"
          >
            <Shield className="w-4 h-4 mr-2 group-hover:text-indigo-700 text-indigo-400" />
            Admin Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;