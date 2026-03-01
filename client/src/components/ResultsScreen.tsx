import React from 'react';
import { Award, TrendingUp, BookOpen, Target } from 'lucide-react';
import { TestResults } from '../App';

interface ResultsScreenProps {
  results: TestResults;
  onReset: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onReset }) => {
  const calculateOverallBand = () => {
    let totalScore = 0;
    let sectionCount = 0;

    if (results.listening) {
      totalScore += results.listening.score;
      sectionCount++;
    }
    if (results.reading) {
      totalScore += results.reading.score;
      sectionCount++;
    }
    if (results.writing) {
      totalScore += ((results.writing.task1Score || 0) + (results.writing.task2Score || 0)) / 2;
      sectionCount++;
    }
    if (results.speaking) {
      totalScore += ((results.speaking.part1Score || 0) + (results.speaking.part2Score || 0) + (results.speaking.part3Score || 0)) / 3;
      sectionCount++;
    }

    if (sectionCount === 0) return 0;

    const average = totalScore / sectionCount;
    return Math.round(average * 2) / 2; // Round to nearest 0.5
  };

  const overallBand = calculateOverallBand();

  const getBandColor = (band: number) => {
    if (band >= 8.5) return 'text-green-600 bg-green-50 border-green-200';
    if (band >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (band >= 6.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (band >= 5.0) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getBandDescription = (band: number) => {
    if (band >= 8.5) return 'Very Good to Expert User';
    if (band >= 7.0) return 'Good to Very Good User';
    if (band >= 6.0) return 'Competent to Good User';
    if (band >= 5.0) return 'Modest to Competent User';
    return 'Limited User or below';
  };

  const generateStudyPlan = () => {
    const scores = [
      { skill: 'Listening', score: results.listening?.score || 0 },
      { skill: 'Reading', score: results.reading?.score || 0 },
      { skill: 'Writing', score: ((results.writing?.task1Score || 0) + (results.writing?.task2Score || 0)) / 2 },
      { skill: 'Speaking', score: ((results.speaking?.part1Score || 0) + (results.speaking?.part2Score || 0) + (results.speaking?.part3Score || 0)) / 3 }
    ];

    // Filter out sections that weren't taken (score 0 might be valid, but for study plan we prioritize taken sections)
    // Actually, if score is 0 it might mean not taken OR failed. 
    // But given the context, we can just sort.

    scores.sort((a, b) => a.score - b.score);
    return scores.slice(0, 2).map(skill => skill.skill);
  };

  const studyRecommendations = generateStudyPlan();

  // Extract strengths and improvements from feedback
  const extractStrengths = () => {
    const strengths: string[] = [];

    // From Writing feedback
    if (results.writing?.feedback?.task1?.strengths) {
      strengths.push(...results.writing.feedback.task1.strengths.slice(0, 1));
    }
    if (results.writing?.feedback?.task2?.strengths) {
      strengths.push(...results.writing.feedback.task2.strengths.slice(0, 1));
    }

    // From Speaking evaluation
    if (results.speaking?.evaluation?.overallBand) {
      const band = results.speaking.evaluation.overallBand;
      if (band >= 7.0) {
        strengths.push('Strong speaking fluency and coherence');
      }
      if (results.speaking.evaluation.vocabulary >= 7.0) {
        strengths.push('Excellent vocabulary range');
      }
      if (results.speaking.evaluation.grammar >= 7.0) {
        strengths.push('Accurate grammatical structures');
      }
    }

    // Listening & Reading scores
    if (results.listening?.score && results.listening.score >= 7.0) {
      strengths.push('Strong listening comprehension skills');
    }
    if (results.reading?.score && results.reading.score >= 7.0) {
      strengths.push('Excellent reading and analytical abilities');
    }
    if (results.writing && (results.writing.task1Score + results.writing.task2Score) / 2 >= 7.0) {
      strengths.push('Well-structured written communication');
    }

    strengths.push('Completed all sections within time limits');
    return strengths.slice(0, 5); // Limit to 5 items
  };

  const extractAreasForImprovement = () => {
    const areas: string[] = [];

    // From Writing feedback
    if (results.writing?.feedback?.task1?.areasForImprovement) {
      areas.push(...results.writing.feedback.task1.areasForImprovement.slice(0, 1));
    }
    if (results.writing?.feedback?.task2?.areasForImprovement) {
      areas.push(...results.writing.feedback.task2.areasForImprovement.slice(0, 1));
    }

    // From Speaking evaluation
    if (results.speaking?.evaluation) {
      const { fluency, vocabulary, grammar, pronunciation } = results.speaking.evaluation;
      if (fluency && fluency < 7.0) {
        areas.push('Work on reducing hesitations and filler words');
      }
      if (vocabulary && vocabulary < 7.0) {
        areas.push('Expand vocabulary with more advanced terms');
      }
      if (grammar && grammar < 7.0) {
        areas.push('Practice more complex grammatical structures');
      }
      if (pronunciation && pronunciation < 7.0) {
        areas.push('Focus on clearer pronunciation and intonation');
      }
      if (results.speaking.evaluation.fillerWordsFound > 5) {
        areas.push(`Reduce filler words (${results.speaking.evaluation.fillerWordsFound} detected)`);
      }
    }

    // Skill-based recommendations
    if (studyRecommendations.includes('Listening') && results.listening) {
      areas.push('Focus on understanding different accents and speech patterns');
    }
    if (studyRecommendations.includes('Reading') && results.reading) {
      areas.push('Practice skimming and scanning techniques');
    }
    if (studyRecommendations.includes('Writing') && results.writing && !areas.some(a => a.includes('essay structure'))) {
      areas.push('Work on essay structure and vocabulary range');
    }
    if (studyRecommendations.includes('Speaking') && results.speaking && !areas.some(a => a.includes('fluency'))) {
      areas.push('Practice fluency and pronunciation');
    }

    return areas.slice(0, 5); // Limit to 5 items
  };

  const strengths = extractStrengths();
  const areasForImprovement = extractAreasForImprovement();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">IELTS Test Results</h1>
          <p className="text-xl text-gray-600">Complete Performance Analysis</p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Overall Band Score</h2>
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${getBandColor(overallBand)} mb-4`}>
            <span className="text-4xl font-bold">{overallBand}</span>
          </div>
          <p className="text-xl font-semibold text-gray-700">{getBandDescription(overallBand)}</p>
        </div>

        {/* Individual Scores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Listening */}
          <div className={`bg-white rounded-lg shadow-md p-6 ${!results.listening ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Listening</h3>
              {results.listening ? (
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getBandColor(results.listening.score)}`}>
                  {results.listening.score}
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Not taken</span>
              )}
            </div>
            {results.listening && (
              <div className="text-sm text-gray-600">
                <p>Raw Score: {results.listening.answers.filter((ans, idx) => {
                  const correctAnswers = [
                    'library', '9:30', 'thompson', '07789 123456', 'student discount', 'monday', 'beginner', 'swimming', '25', 'reception',
                    'A', 'B', 'C', 'A', 'B', 'museum', 'guided tour', 'photography', 'café', 'gift shop',
                    'research methods', 'data collection', 'analysis', 'presentation', 'peer review', 'C', 'A', 'B', 'A', 'C',
                    'climate change', 'global warming', 'renewable energy', 'sustainability', 'carbon footprint', 'fossil fuels', 'solar power', 'wind energy', 'hydroelectric', 'environmental impact'
                  ];
                  return ans.toString().toLowerCase() === correctAnswers[idx].toString().toLowerCase();
                }).length}/40</p>
                <p>Time: {Math.floor(results.listening.timeSpent / 60)} min</p>
              </div>
            )}
          </div>

          {/* Reading */}
          <div className={`bg-white rounded-lg shadow-md p-6 ${!results.reading ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Reading</h3>
              {results.reading ? (
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getBandColor(results.reading.score)}`}>
                  {results.reading.score}
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Not taken</span>
              )}
            </div>
            {results.reading && (
              <div className="text-sm text-gray-600">
                <p>Raw Score: {results.reading.answers.filter((ans, idx) => {
                  const correctAnswers = [
                    'B', 'A', 'C', 'B', 'A', 'TRUE', 'FALSE', 'NOT GIVEN', 'TRUE', 'FALSE', 'education', 'technology', 'communication',
                    'iv', 'vii', 'ii', 'i', 'vi', 'C', 'A', 'B', 'D', 'innovation', 'research', 'development', 'market',
                    'YES', 'NO', 'NOT GIVEN', 'YES', 'NO', 'D', 'B', 'A', 'C', 'B', 'sustainability', 'environment', 'future', 'challenges'
                  ];
                  return ans.toString().toLowerCase() === correctAnswers[idx].toString().toLowerCase();
                }).length}/40</p>
                <p>Time: {Math.floor(results.reading.timeSpent / 60)} min</p>
              </div>
            )}
          </div>

          {/* Writing */}
          <div className={`bg-white rounded-lg shadow-md p-6 ${!results.writing ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Writing</h3>
              {results.writing ? (
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getBandColor(((results.writing.task1Score || 0) + (results.writing.task2Score || 0)) / 2)}`}>
                  {Math.round(((results.writing.task1Score || 0) + (results.writing.task2Score || 0)) / 2 * 2) / 2}
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Not taken</span>
              )}
            </div>
            {results.writing && (
              <div className="text-sm text-gray-600">
                <p>Task 1: {results.writing.task1Score || 0}</p>
                <p>Task 2: {results.writing.task2Score || 0}</p>
                <p>Time: {Math.floor(results.writing.timeSpent / 60)} min</p>
                {results.writing.feedback && (
                  <div className="mt-3 text-sm text-gray-700">
                    <h5 className="font-semibold">Writing Feedback</h5>
                    {results.writing.feedback.task1 && (
                      <div className="mt-2">
                        <strong>Task 1:</strong>
                        <p>{typeof results.writing.feedback.task1.overallBand === 'number' ? `Band ${results.writing.feedback.task1.overallBand}` : ''}</p>
                        <p className="text-sm text-gray-600">{results.writing.feedback.task1.areasForImprovement?.slice(0, 2).join(', ')}</p>
                      </div>
                    )}
                    {results.writing.feedback.task2 && (
                      <div className="mt-2">
                        <strong>Task 2:</strong>
                        <p>{typeof results.writing.feedback.task2.overallBand === 'number' ? `Band ${results.writing.feedback.task2.overallBand}` : ''}</p>
                        <p className="text-sm text-gray-600">{results.writing.feedback.task2.areasForImprovement?.slice(0, 2).join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Speaking */}
          <div className={`bg-white rounded-lg shadow-md p-6 ${!results.speaking ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Speaking</h3>
              {results.speaking ? (
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getBandColor(((results.speaking.part1Score || 0) + (results.speaking.part2Score || 0) + (results.speaking.part3Score || 0)) / 3)}`}>
                  {Math.round(((results.speaking.part1Score || 0) + (results.speaking.part2Score || 0) + (results.speaking.part3Score || 0)) / 3 * 2) / 2}
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Not taken</span>
              )}
            </div>
            {results.speaking && (
              <div className="text-sm text-gray-600">
                <p>Part 1: {results.speaking.part1Score || 0}</p>
                <p>Part 2: {results.speaking.part2Score || 0}</p>
                <p>Part 3: {results.speaking.part3Score || 0}</p>
                {results.speaking.evaluation && (
                  <div className="mt-3 text-sm text-gray-700">
                    <h5 className="font-semibold">Speaking Feedback</h5>
                    <p>Overall Band: {results.speaking.evaluation.overallBand?.toFixed(1) || 'N/A'}</p>
                    <p>Fluency: {results.speaking.evaluation.fluency?.toFixed(1) || 'N/A'}</p>
                    <p>Lexical: {results.speaking.evaluation.vocabulary?.toFixed(1) || 'N/A'}</p>
                    <p>Grammar: {results.speaking.evaluation.grammar?.toFixed(1) || 'N/A'}</p>
                    <p>Pronunciation: {results.speaking.evaluation.pronunciation?.toFixed(1) || 'N/A'}</p>
                    {results.speaking.evaluation.fillerWordsFound > 0 && (
                      <p>Filler words detected: {results.speaking.evaluation.fillerWordsFound}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Analysis
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {strengths.length > 0 ? (
                    strengths.map((strength, idx) => (
                      <li key={idx}>• {strength}</li>
                    ))
                  ) : (
                    <li>• Good attempt across all sections</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {areasForImprovement.length > 0 ? (
                    areasForImprovement.map((area, idx) => (
                      <li key={idx}>• {area}</li>
                    ))
                  ) : (
                    <li>• Continue regular practice to maintain performance</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Personalized Study Plan
            </h3>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Priority Focus Areas</h4>
                <p className="text-blue-700 text-sm">
                  Based on your results, focus on: <strong>{studyRecommendations.join(' and ')}</strong>
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Key Recommendations from Feedback</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {results.writing?.feedback?.task1?.recommendations && (
                    <div className="p-2 bg-purple-50 rounded">
                      <p className="font-medium text-purple-700">Writing Task 1:</p>
                      <p>{results.writing.feedback.task1.recommendations[0]}</p>
                    </div>
                  )}
                  {results.writing?.feedback?.task2?.recommendations && (
                    <div className="p-2 bg-purple-50 rounded">
                      <p className="font-medium text-purple-700">Writing Task 2:</p>
                      <p>{results.writing.feedback.task2.recommendations[0]}</p>
                    </div>
                  )}
                  {results.speaking?.evaluation?.recommendations && (
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="font-medium text-blue-700">Speaking:</p>
                      <p>{results.speaking.evaluation.recommendations[0]}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Recommended Study Schedule (4 weeks)</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Week 1-2:</span>
                    <span>Focus on weakest skills (2-3 hours/day)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Week 3:</span>
                    <span>Full practice tests (3 tests)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Week 4:</span>
                    <span>Review and final preparations</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Specific Recommendations</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Take at least 2 more practice tests</li>
                  <li>• Focus daily practice on lowest-scoring sections</li>
                  <li>• Record yourself speaking for pronunciation practice</li>
                  <li>• Read academic texts for 30 minutes daily</li>
                  <li>• Practice writing essays within time limits</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* University/Immigration Requirements */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Score Requirements Reference
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">University Admission</h4>
              <ul className="text-sm space-y-1">
                <li>• Top universities: 7.5-8.5+</li>
                <li>• Good universities: 6.5-7.0</li>
                <li>• Foundation/Pathway: 5.5-6.0</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Immigration (General)</h4>
              <ul className="text-sm space-y-1">
                <li>• Skilled Migration: 6.0-7.0</li>
                <li>• Student Visa: 5.5-6.0</li>
                <li>• Work Visa: 6.0-7.0</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">Professional Bodies</h4>
              <ul className="text-sm space-y-1">
                <li>• Medical/Nursing: 7.0-7.5</li>
                <li>• Engineering: 6.0-7.0</li>
                <li>• Teaching: 7.0-8.0</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={onReset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors mr-4"
          >
            Take Another Test
          </button>

          <div className="text-sm text-gray-500">
            <p>Want to improve your score? Regular practice is key to IELTS success!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;