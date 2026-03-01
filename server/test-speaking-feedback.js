const { generateSpeakingFeedback } = require('./services/feedbackService');

// Test cases for speaking feedback
const testCases = [
  {
    name: 'Excellent fluency and vocabulary',
    transcript: 'Well, I come from a beautiful city in Pakistan called Islamabad. It is located in the northern part of the country and is known for its stunning natural beauty, particularly the Margalla Hills. The city was built in the 1960s as a planned capital, which means it has very well-organized infrastructure and architecture. I really appreciate the clean air and green spaces that are abundant throughout the city. Moreover, the weather is quite pleasant most of the year, though summers can be quite hot. The city has a rich cultural heritage with many museums and historical monuments. I have lived there for most of my life and it has shaped my character significantly.',
    partNumber: 1
  },
  {
    name: 'Moderate fluency with some pauses',
    transcript: 'Um, I am from, uh, a small town near the coast. It is, you know, really nice place with beaches. The weather is like, very hot most of the time. I think people there are friendly. They are, basically, very helpful to each other. The town has some restaurants and shops.',
    partNumber: 1
  },
  {
    name: 'Part 2 - Long turn response',
    transcript: 'Let me talk about a memorable journey I took last year. I went to Turkey with my best friend, and we spent two weeks exploring different cities. We started in Istanbul, which is absolutely incredible with its historical architecture and vibrant culture. We visited the Blue Mosque and the Hagia Sophia, which were breathtaking. Then we traveled to Cappadocia, where we took a hot air balloon ride at sunrise. That was one of the most amazing experiences of my life because it gave us a panoramic view of the fairy chimneys and the beautiful landscape. After that, we went to Antalya, a coastal city with pristine beaches. This journey was memorable because it allowed me to experience diverse cultures, try different cuisines, and strengthen my friendship. We took countless photographs and created lasting memories. The experience has inspired me to travel more and explore different parts of the world.',
    partNumber: 2
  },
  {
    name: 'Part 3 - Discussion with complex structures',
    transcript: 'I believe tourism has become increasingly important in modern society because it allows people to broaden their perspectives and understand different cultures. Although there are some negative impacts such as environmental degradation and cultural commodification, the benefits generally outweigh the drawbacks. For instance, tourism provides economic opportunities for local communities, particularly in developing countries. Furthermore, it facilitates cross-cultural understanding and promotes peace. However, it is crucial that tourism is managed sustainably to preserve the natural and cultural heritage for future generations. Additionally, governments should implement strict regulations to minimize the negative impacts while maximizing the positive contributions of the tourism industry.',
    partNumber: 3
  },
  {
    name: 'Low fluency with many fillers',
    transcript: 'Like, um, I think, you know, uh, traveling is like really good. Um, like, people should travel because it is, you know, like, interesting. Tourism is like, good for the economy, um, basically. But like, um, it can damage the environment, you know.',
    partNumber: 3
  }
];

console.log('🎤 IELTS Speaking Feedback Test Suite\n');
console.log('='.repeat(80) + '\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Part: ${testCase.partNumber}`);
  console.log('-'.repeat(80));
  
  const feedback = generateSpeakingFeedback(testCase.transcript, testCase.partNumber);
  
  console.log(`\n📊 Overall Results:`);
  console.log(`  Overall Band Score: ${feedback.overallBand}`);
  console.log(`  Performance Level: ${feedback.performanceLevel}`);
  console.log(`  Word Count: ${feedback.wordCount}`);
  console.log(`  Sentence Count: ${feedback.sentenceCount}`);
  console.log(`  Filler Words Found: ${feedback.fillerWordsFound}`);
  console.log(`  Filler Ratio: ${feedback.fillerRatio}%`);
  
  console.log(`\n📈 Component Scores:`);
  console.log(`  Fluency & Coherence: ${feedback.fluency}`);
  console.log(`  Lexical Resource (Vocabulary): ${feedback.vocabulary}`);
  console.log(`  Grammatical Range & Accuracy: ${feedback.grammar}`);
  console.log(`  Pronunciation: ${feedback.pronunciation}`);
  
  console.log(`\n💬 Feedback Details:`);
  if (Object.keys(feedback.feedback).length > 0) {
    Object.entries(feedback.feedback).forEach(([key, value]) => {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    });
  } else {
    console.log('  No specific feedback issues detected');
  }
  
  console.log(`\n✅ Recommendations:`);
  feedback.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
});

console.log('✨ Test suite completed!\n');
