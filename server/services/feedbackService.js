const { GoogleGenAI } = require("@google/genai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize the new Google Gen AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// The model we will use (from new SDK conventions)
let _cachedModelName = null;

async function getWorkingModel() {
  if (_cachedModelName) {
    return _cachedModelName;
  }

  // Use the environment model or fallback to 2.5-flash which is widely supported
  const candidate = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  _cachedModelName = candidate;
  return candidate;
}


/**
 * Generate feedback for Listening Module
 * Based on number of correct answers
 */
function generateListeningFeedback(correctAnswers, totalQuestions) {
  const percentage = (correctAnswers / totalQuestions) * 100;
  let score = 0;
  let feedback = '';
  let recommendations = [];

  // IELTS Listening Band Calculation (0-40 correct = Band 0-9)
  if (correctAnswers >= 39) score = 9.0;
  else if (correctAnswers >= 37) score = 8.5;
  else if (correctAnswers >= 35) score = 8.0;
  else if (correctAnswers >= 33) score = 7.5;
  else if (correctAnswers >= 30) score = 7.0;
  else if (correctAnswers >= 26) score = 6.5;
  else if (correctAnswers >= 23) score = 6.0;
  else if (correctAnswers >= 19) score = 5.5;
  else if (correctAnswers >= 16) score = 5.0;
  else if (correctAnswers >= 13) score = 4.5;
  else if (correctAnswers >= 11) score = 4.0;
  else if (correctAnswers >= 8) score = 3.5;
  else if (correctAnswers >= 6) score = 3.0;
  else score = 1.0;

  // Generate feedback based on percentage
  if (percentage >= 90) {
    feedback = 'Excellent performance! You demonstrated strong listening comprehension and attention to detail.';
    recommendations = [
      'Continue maintaining your excellent listening skills',
      'Try more advanced IELTS materials to further challenge yourself',
      'Focus on distinguishing between similar accent variations'
    ];
  } else if (percentage >= 75) {
    feedback = 'Very good performance! You have solid listening comprehension skills with room for improvement.';
    recommendations = [
      'Practice listening to different accent variations',
      'Focus on understanding fast speech and natural pauses',
      'Work on note-taking strategies for better retention',
      'Listen to authentic materials like podcasts and documentaries'
    ];
  } else if (percentage >= 60) {
    feedback = 'Good effort! You can understand main ideas but need to improve on details.';
    recommendations = [
      'Practice listening to each section multiple times',
      'Focus on understanding specific details and numbers',
      'Improve your spelling and accurate note-taking',
      'Listen to various types of English accents',
      'Pay more attention to signal words that indicate answers'
    ];
  } else if (percentage >= 45) {
    feedback = 'You need more practice. Focus on listening more carefully for key information.';
    recommendations = [
      'Start with slower materials and gradually increase speed',
      'Practice identifying main ideas vs. supporting details',
      'Work on recognizing pronunciation patterns',
      'Use subtitles when practicing to connect sounds with words',
      'Build vocabulary to recognize answers more easily'
    ];
  } else {
    feedback = 'Significant improvement needed. Start with basics and build gradually.';
    recommendations = [
      'Begin with beginner-level listening materials',
      'Focus on common words and phrases first',
      'Practice daily for at least 30 minutes',
      'Use interactive listening exercises',
      'Consider formal listening classes for guidance'
    ];
  }

  return {
    score: parseFloat(score.toFixed(1)),
    percentage: Math.round(percentage),
    correctAnswers,
    totalQuestions,
    feedback,
    recommendations,
    performanceLevel: getPerformanceLevel(score)
  };
}

/**
 * Generate feedback for Reading Module
 * Based on number of correct answers
 */
function generateReadingFeedback(correctAnswers, totalQuestions) {
  const percentage = (correctAnswers / totalQuestions) * 100;
  let score = 0;
  let feedback = '';
  let recommendations = [];

  // IELTS Reading Band Calculation (0-40 correct = Band 0-9)
  if (correctAnswers >= 39) score = 9.0;
  else if (correctAnswers >= 37) score = 8.5;
  else if (correctAnswers >= 35) score = 8.0;
  else if (correctAnswers >= 33) score = 7.5;
  else if (correctAnswers >= 30) score = 7.0;
  else if (correctAnswers >= 26) score = 6.5;
  else if (correctAnswers >= 23) score = 6.0;
  else if (correctAnswers >= 19) score = 5.5;
  else if (correctAnswers >= 16) score = 5.0;
  else if (correctAnswers >= 13) score = 4.5;
  else if (correctAnswers >= 11) score = 4.0;
  else if (correctAnswers >= 8) score = 3.5;
  else if (correctAnswers >= 6) score = 3.0;
  else score = 1.0;

  if (percentage >= 90) {
    feedback = 'Exceptional reading skills! You demonstrated excellent comprehension and speed.';
    recommendations = [
      'Explore academic texts and journals',
      'Challenge yourself with dense, technical materials',
      'Work on skimming and scanning faster passages'
    ];
  } else if (percentage >= 75) {
    feedback = 'Very good! You have strong reading comprehension with minor gaps.';
    recommendations = [
      'Practice reading diverse text types more regularly',
      'Improve vocabulary through extensive reading',
      'Work on reading speed while maintaining accuracy',
      'Practice understanding implicit meanings and inferences'
    ];
  } else if (percentage >= 60) {
    feedback = 'Good progress! Focus on improving accuracy and understanding nuances.';
    recommendations = [
      'Read a wider range of materials (news, articles, academic texts)',
      'Build vocabulary from context',
      'Practice understanding implicit and explicit information',
      'Work on skimming for main ideas and scanning for details',
      'Pay attention to connecting words and relationships'
    ];
  } else if (percentage >= 45) {
    feedback = 'Basic understanding present. Intensive practice needed to improve.';
    recommendations = [
      'Start with simpler texts and gradually increase difficulty',
      'Build core vocabulary essential for IELTS',
      'Practice reading with a timer to work on speed',
      'Focus on understanding main ideas before details',
      'Use glossaries to help understand unfamiliar words'
    ];
  } else {
    feedback = 'Significant effort needed. Build a strong foundation first.';
    recommendations = [
      'Begin with beginner-level English texts',
      'Focus on everyday vocabulary and common phrases',
      'Read short articles and simple passages daily',
      'Use translation tools initially to understand content',
      'Consider reading instruction or tutoring'
    ];
  }

  return {
    score: parseFloat(score.toFixed(1)),
    percentage: Math.round(percentage),
    correctAnswers,
    totalQuestions,
    feedback,
    recommendations,
    performanceLevel: getPerformanceLevel(score)
  };
}

// --- Rate Limiting Queue ---
const requestQueue = [];
let isProcessingQueue = false;

async function executeWithRetry(fn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ fn, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const { fn, resolve, reject } = requestQueue.shift();

    let retries = 3;
    let delay = 1000;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const result = await fn();
        resolve(result);
        success = true;
      } catch (error) {
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
          retries--;
          if (retries === 0) {
            reject(error);
          } else {
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
          }
        } else {
          reject(error);
          success = true; // exit loop on non-429 errors
        }
      }
    }

    // Add a delay between requests to stay under 5 requests per minute
    await new Promise(r => setTimeout(r, 12100));
  }

  isProcessingQueue = false;
}
// ---------------------------

/**
 * Generate feedback for Writing Module using Gemini API
 * Evaluates based on IELTS criteria: Grammar, Vocabulary, Coherence, Task Achievement
 */
async function generateWritingFeedback(text, taskType = 'task1') {
  const prompt = `You are an IELTS writing examiner.
   Evaluate the following ${taskType === 'task1' ? 'Task 1 (Formal Letter/Report)' :
     'Task 2 (Essay)'} response based on these IELTS criteria:\n\n1. **Task Achievement** (0-9):
      Does the response fully address the task requirements?\n2. **Coherence and Cohesion** (0-9): 
      How well organized and connected is the writing?\n3. **Lexical Resource** (0-9): 
      Range and accuracy of vocabulary used\n4. **Grammatical Range and Accuracy** (0-9):
       Range and accuracy of grammar structures\n\nText to evaluate:\n"""\n${text}\n"""\n\nProvide your response in this exact JSON format:
       \n{\n  "taskAchievement": {\n    "score": <number 0-9>,\n    "feedback": "<specific feedback>"\n  },\n  "coherenceAndCohesion":
        {\n    "score": <number 0-9>,\n    "feedback": "<specific feedback>"\n  },\n  "lexicalResource": {\n    "score": <number 0-9>,\n 
           "feedback": "<specific feedback>"\n  },\n  "grammaticalRange": {\n    "score": <number 0-9>,\n    "feedback": "<specific feedback>"\n  },\n 
            "strengths": ["<strength1>", "<strength2>"],\n  "areasForImprovement": ["<area1>", "<area2>"],\n
              "recommendations": ["<recommendation1>", "<recommendation2>", "<recommendation3>"],\n 
               "overallBand": <number 0-9>\n}`;

  try {
    const modelName = await getWorkingModel();
    const result = await executeWithRetry(async () => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt
      });
    });

    const responseText = result.text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const evaluation = JSON.parse(jsonMatch[0]);
      return {
        ...evaluation,
        wordCount: text.split(/\s+/).length,
        taskType: taskType
      };
    }

    return getDefaultWritingFeedback(text, taskType);
  } catch (error) {
    console.error('Error calling Gemini API for writing feedback:', error);
    return getDefaultWritingFeedback(text, taskType);
  }
}

/**
 * Fallback writing feedback if API fails
 */
function getDefaultWritingFeedback(text, taskType) {
  const wordCount = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  // Basic analysis
  let taskScore = 6.0;
  let coherenceScore = 5.5;
  let lexicalScore = 5.5;
  let grammarScore = 5.5;

  // Task Achievement
  if (taskType === 'task1' && wordCount >= 150) taskScore += 1.0;
  else if (taskType === 'task2' && wordCount >= 250) taskScore += 1.5;
  if (paragraphs.length >= 2) taskScore += 0.5;

  // Coherence and Cohesion
  if (paragraphs.length >= 3) coherenceScore += 1.0;
  if (sentences.length >= 5) coherenceScore += 0.5;

  // Lexical Resource
  const uniqueWords = new Set(text.toLowerCase().match(/\b\w+\b/g) || []);
  const diversity = uniqueWords.size / (text.toLowerCase().match(/\b\w+\b/g) || []).length;
  if (diversity > 0.6) lexicalScore += 1.5;
  if (wordCount > 300) lexicalScore += 0.5;

  // Grammar
  const hasComplexStructures = /because|however|although|therefore|consequently/i.test(text);
  if (hasComplexStructures) grammarScore += 1.0;
  if (text.match(/,/g)?.length > 5) grammarScore += 0.5;

  const overallBand = Math.min((taskScore + coherenceScore + lexicalScore + grammarScore) / 4, 9.0);

  return {
    taskAchievement: {
      score: Math.min(taskScore, 9.0),
      feedback: wordCount >= (taskType === 'task1' ? 150 : 250)
        ? 'You have met the word count requirement. Focus on coherent organization.'
        : `Your response is ${taskType === 'task1' ? 150 : 250} words or more for good scoring.`
    },
    coherenceAndCohesion: {
      score: Math.min(coherenceScore, 9.0),
      feedback: paragraphs.length >= 3
        ? 'Good paragraph structure. Ensure smooth transitions between ideas.'
        : 'Improve organization by creating clear paragraphs for different ideas.'
    },
    lexicalResource: {
      score: Math.min(lexicalScore, 9.0),
      feedback: diversity > 0.6
        ? 'Good vocabulary range. Use more sophisticated and subject-specific terms.'
        : 'Work on expanding vocabulary to express ideas more precisely.'
    },
    grammaticalRange: {
      score: Math.min(grammarScore, 9.0),
      feedback: hasComplexStructures
        ? 'You use some complex structures. Ensure accuracy with varied sentences.'
        : 'Try using more complex sentence structures with subordinate clauses.'
    },
    strengths: [
      wordCount >= (taskType === 'task1' ? 150 : 250) ? 'Adequate length' : 'Clear attempt to address task',
      'Attempts to organize ideas'
    ],
    areasForImprovement: [
      'Coherence and flow of ideas',
      'Vocabulary diversity and precision',
      'Grammatical complexity and accuracy'
    ],
    recommendations: [
      'Review IELTS band descriptors for your target score',
      'Write multiple practice essays and get feedback',
      'Focus on using connective words and transitional phrases',
      'Study and use more sophisticated vocabulary'
    ],
    overallBand: parseFloat(overallBand.toFixed(1)),
    wordCount,
    taskType
  };
}

/**
 * Generate feedback for Speaking Module
 * Based on transcript analysis focusing on fluency and minimal filler words
 */
/**
 * Generate feedback for Speaking Module using Gemini API
 * Falls back to heuristic method if API fails
 */
async function generateSpeakingFeedback(transcript, partNumber) {
  // Get basic metrics and fallback scores first
  const basicFeedback = getDefaultSpeakingFeedback(transcript, partNumber);

  try {
    const prompt = `You are an IELTS speaking examiner. Evaluate the following Part ${partNumber} response based on these IELTS criteria:
1. **Fluency and Coherence** (0-9): Ability to speak at length with minimal hesitation and logical flow.
2. **Lexical Resource** (0-9): Range and accuracy of vocabulary.
3. **Grammatical Range and Accuracy** (0-9): Variety and correctness of sentence structures.
4. **Pronunciation** (0-9): Clarity and intonation (estimate based on text, assuming average pronunciation unless clear issues in transcript like repetitions).

Transcript:
"""
${transcript}
"""

Provide your response in this exact JSON format:
{
  "fluency": <number 0-9>,
  "vocabulary": <number 0-9>,
  "grammar": <number 0-9>,
  "pronunciation": <number 0-9>,
  "overallBand": <number 0-9>,
  "feedback": {
    "fluency": "<specific feedback>",
    "vocabulary": "<specific feedback>",
    "grammar": "<specific feedback>",
    "pronunciation": "<specific feedback>"
  },
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
}`;

    const modelName = await getWorkingModel();
    const result = await executeWithRetry(async () => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt
      });
    });

    const responseText = result.text;

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const geminiEvaluation = JSON.parse(jsonMatch[0]);

      // Merge Gemini results with basic metrics
      return {
        ...basicFeedback,
        ...geminiEvaluation,
        // Ensure we keep the calculated metrics that Gemini can't do well on text alone
        wordCount: basicFeedback.wordCount,
        sentenceCount: basicFeedback.sentenceCount,
        fillerWordsFound: basicFeedback.fillerWordsFound,
        fillerRatio: basicFeedback.fillerRatio,
        partNumber: basicFeedback.partNumber,
        performanceLevel: getPerformanceLevel(geminiEvaluation.overallBand)
      };
    }
  } catch (error) {
    console.error('Error calling Gemini API for speaking feedback:', error);
  }

  return basicFeedback;
}

/**
 * Generate feedback for Speaking Module (Heuristic / Fallback)
 * Based on transcript analysis focusing on fluency and minimal filler words
 */
function getDefaultSpeakingFeedback(transcript, partNumber) {
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Filler words detection - more accurate detection
  const fillerWords = ['um', 'uh', 'uhh', 'er', 'err', 'erm', 'like', 'basically', 'actually', 'literally', 'sort', 'kind', 'well', 'actually', 'you know'];

  // Count actual filler words more accurately
  let fillerWordsFound = 0;
  const fillerWordsFoundList = [];

  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[,!?.]/g, '');
    if (fillerWords.includes(cleanWord)) {
      fillerWordsFound++;
      fillerWordsFoundList.push(word);
    }
  });

  // Also check for "you know" as a phrase
  const youKnowCount = (transcript.toLowerCase().match(/you\s+know/g) || []).length;
  fillerWordsFound = Math.max(fillerWordsFound, youKnowCount);

  // Calculate scores
  let fluency = 5.0;
  let vocabulary = 5.0;
  let grammar = 5.0;
  let pronunciation = 5.0;
  let feedback = {};
  let recommendations = [];

  // Fluency & Coherence Scoring
  const wordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
  const fillerRatio = wordCount > 0 ? fillerWordsFound / wordCount : 0;

  if (wordCount >= 80 && wordsPerSentence >= 8 && fillerRatio < 0.05) {
    fluency = 8.0;
  } else if (wordCount >= 60 && wordsPerSentence >= 6 && fillerRatio < 0.08) {
    fluency = 7.0;
  } else if (wordCount >= 40 && wordsPerSentence >= 4 && fillerRatio < 0.10) {
    fluency = 6.0;
  } else if (wordCount >= 20 && fillerRatio < 0.15) {
    fluency = 5.0;
  } else if (fillerRatio < 0.20) {
    fluency = 4.0;
  } else {
    fluency = 3.0;
  }

  // Vocabulary (Lexical Resource)
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[,!?.]/g, '')));
  const lexicalDiversity = uniqueWords.size / wordCount;

  if (lexicalDiversity > 0.75 && wordCount > 100) {
    vocabulary = 8.0;
  } else if (lexicalDiversity > 0.65 && wordCount > 60) {
    vocabulary = 7.0;
  } else if (lexicalDiversity > 0.55) {
    vocabulary = 6.0;
  } else if (lexicalDiversity > 0.40) {
    vocabulary = 5.0;
  } else {
    vocabulary = 4.0;
  }

  // Grammar
  const hasComplexStructures = /because|however|although|if|when|unless|while|since/i.test(transcript);
  const hasCorrectPronouns = /[^a-z]I[^a-z]/i.test(transcript) || /my|me|myself/i.test(transcript);

  if (hasComplexStructures && hasCorrectPronouns && wordCount > 60) {
    grammar = 7.5;
  } else if (hasComplexStructures || wordCount > 50) {
    grammar = 6.5;
  } else if (hasCorrectPronouns && wordCount > 30) {
    grammar = 5.5;
  } else if (wordCount > 20) {
    grammar = 4.5;
  } else {
    grammar = 3.5;
  }

  // Pronunciation (based on word complexity)
  const longWords = words.filter(w => w.length > 7).length;
  const pronunciationScore = (longWords / Math.max(wordCount, 1)) * 10;

  if (wordCount > 80 && longWords > 10) {
    pronunciation = 7.5;
  } else if (wordCount > 50 && longWords > 5) {
    pronunciation = 6.5;
  } else if (wordCount > 30) {
    pronunciation = 5.5;
  } else {
    pronunciation = 4.5;
  }

  // Generate specific feedback
  if (fillerWordsFound > 0) {
    feedback.fillerWords = {
      count: fillerWordsFound,
      message: `Detected ${fillerWordsFound} filler word(s). Reduce these to improve fluency.`,
      found: fillerWordsFoundList.slice(0, 5)
    };
  }

  if (wordCount < 30) {
    feedback.length = 'Your response is quite short. Try to elaborate more.';
    recommendations.push('Aim for at least 40-50 words in Part 1, 120+ in Part 2, and 60+ in Part 3');
  }

  if (sentences.length < 3) {
    feedback.sentences = 'Use more sentences to express your ideas clearly.';
    recommendations.push('Break down ideas into multiple sentences for better clarity');
  }

  // Adjust scores based on part
  if (partNumber === 2 && wordCount < 120) {
    fluency -= 0.5;
    feedback.part2 = 'Part 2 requires longer responses (2 minutes / ~160+ words). Expand your answer.';
  } else if (partNumber === 2 && fillerRatio > 0.08) {
    fluency -= 0.5;
  }

  if (partNumber === 3 && grammar < 6.0) {
    grammar += 0.5; // More lenient for complex discussion
  }

  // Cap scores
  fluency = Math.max(Math.min(fluency, 9.0), 1.0);
  vocabulary = Math.max(Math.min(vocabulary, 9.0), 1.0);
  grammar = Math.max(Math.min(grammar, 9.0), 1.0);
  pronunciation = Math.max(Math.min(pronunciation, 9.0), 1.0);

  const overallBand = ((fluency + vocabulary + grammar + pronunciation) / 4).toFixed(1);

  // Generate recommendations
  if (fluency < 7) {
    recommendations.push('Practice speaking continuously without pauses or hesitations');
    recommendations.push('Record yourself and listen back to identify repetitive patterns');
  }
  if (vocabulary < 7) {
    recommendations.push('Learn and use more advanced and topic-specific vocabulary');
    recommendations.push('Avoid repeating simple words like "good", "bad", "nice"');
  }
  if (grammar < 7) {
    recommendations.push('Use more varied sentence structures and complex grammar');
    recommendations.push('Focus on tense consistency and subject-verb agreement');
  }

  return {
    fluency: parseFloat(fluency.toFixed(1)),
    vocabulary: parseFloat(vocabulary.toFixed(1)),
    grammar: parseFloat(grammar.toFixed(1)),
    pronunciation: parseFloat(pronunciation.toFixed(1)),
    overallBand: parseFloat(overallBand),
    wordCount,
    sentenceCount: sentences.length,
    fillerWordsFound,
    fillerRatio: parseFloat((fillerRatio * 100).toFixed(2)),
    feedback,
    recommendations: recommendations.length > 0 ? recommendations : [
      'Continue practicing to maintain your excellent performance',
      'Focus on maintaining this level of fluency'
    ],
    performanceLevel: getPerformanceLevel(parseFloat(overallBand)),
    partNumber
  };
}

/**
 * Helper function to determine performance level based on band score
 */
function getPerformanceLevel(score) {
  if (score >= 8.5) return 'Expert';
  if (score >= 8.0) return 'Very Good';
  if (score >= 7.0) return 'Good';
  if (score >= 6.0) return 'Competent';
  if (score >= 5.0) return 'Adequate';
  if (score >= 4.0) return 'Limited';
  return 'Poor';
}/**
 * Generate a personalized 30-day study plan using Gemini API
 */
async function generatePersonalizedStudyPlan(level, weakAreas) {
  const prompt = `You are an expert IELTS tutor. Create a highly customized, intensive 30-day study plan for a student whose current level is "${level}". 
  Their weakest areas based on a diagnostic test are: ${weakAreas.join(', ')}.
  
  You MUST return an array of exactly 30 JSON objects (Day 1 to Day 30).
  Format:
  [
    {
      "day": 1,
      "title": "Mastering True/False/Not Given",
      "tasks": ["Actionable task 1", "Actionable task 2"],
      "searchQuery": "IELTS Reading True False Not Given strategies"
    }
  ]
  
  Rules:
  1. Days 1-10 must heavily target their specific weak areas.
  2. Days 11-20 should build advanced vocabulary and complex grammar structures.
  3. Days 21-30 should focus on full mock tests, timing, and advanced strategies.`;

  try {
    const modelName = await getWorkingModel();
    // Initialize AI instance
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const result = await executeWithRetry(async () => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json" // THIS STOPS THE CRASHES
        }
      });
    });

    return JSON.parse(result.text);
  } catch (error) {
    console.error('Error generating 30-day plan:', error);
    // Bulletproof fallback plan
    return Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      title: `IELTS Core Practice Day ${i + 1}`,
      tasks: ['Complete 1 Reading Passage', 'Review Vocabulary'],
      searchQuery: 'IELTS daily practice test'
    }));
  }
}

// Make sure this is exactly how your exports look at the bottom!
module.exports = {
  generateListeningFeedback,
  generateReadingFeedback,
  generateWritingFeedback,
  generateSpeakingFeedback,
  getPerformanceLevel,
  generatePersonalizedStudyPlan // <--- MUST BE EXPORTED
};