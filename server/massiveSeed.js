require('dotenv').config();
const mongoose = require('mongoose');
const ReadingTest = require('./models/ReadingTest');
const ListeningTest = require('./models/ListeningTest');
const WritingTest = require('./models/WritingTest');
const SpeakingTest = require('./models/SpeakingTest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts_prep';

// 1. EXACTLY 15 DISTINCT READING QUESTIONS (NO REPEATS)
const getReadingQs = (topic) => [
  { number: 1, type: 'true_false_not_given', text: `1. The initial theories regarding ${topic} were proven entirely correct by modern science.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'False' },
  { number: 2, type: 'true_false_not_given', text: `2. Funding for ${topic} research has doubled in the last five years.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'Not Given' },
  { number: 3, type: 'true_false_not_given', text: `3. Archaeological discoveries forced scholars to rethink the timeline of ${topic}.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'True' },
  { number: 4, type: 'true_false_not_given', text: `4. The general public is currently unaware of the implications of ${topic}.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'False' },
  { number: 5, type: 'true_false_not_given', text: `5. Future progress in ${topic} relies heavily on international cooperation.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'True' },
  { number: 6, type: 'multiple_choice', text: `6. What is the primary purpose of the first paragraph?`, options: ['To introduce historical context', 'To criticize older theories', 'To provide statistical data', 'To propose a new law'], correctAnswer: 'To introduce historical context' },
  { number: 7, type: 'multiple_choice', text: `7. According to the text, what was the main flaw of early 20th-century scholars?`, options: ['Lack of funding', 'Ignored structural evidence', 'Poor technology', 'Language barriers'], correctAnswer: 'Ignored structural evidence' },
  { number: 8, type: 'multiple_choice', text: `8. What does the word "unprecedented" refer to in the passage?`, options: ['The level of danger', 'The sudden surge in research', 'The cost of materials', 'The lack of interest'], correctAnswer: 'The sudden surge in research' },
  { number: 9, type: 'multiple_choice', text: `9. Which sector is most likely to be affected by ${topic} in the next decade?`, options: ['Agriculture', 'Global sustainability', 'Entertainment', 'Transportation'], correctAnswer: 'Global sustainability' },
  { number: 10, type: 'multiple_choice', text: `10. What is the author's overall tone regarding ${topic}?`, options: ['Pessimistic', 'Neutral', 'Optimistic and urgent', 'Sarcastic'], correctAnswer: 'Optimistic and urgent' },
  { number: 11, type: 'fill_in_the_blank', text: `11. Early scholars mistakenly believed that progress in this field was completely ______.`, correctAnswer: 'accidental' },
  { number: 12, type: 'fill_in_the_blank', text: `12. Recent evidence reveals that our ancestors used a highly ______ approach.`, correctAnswer: 'structured' },
  { number: 13, type: 'fill_in_the_blank', text: `13. The next decade will experience a significant increase in ______ for this sector.`, correctAnswer: 'funding' },
  { number: 14, type: 'fill_in_the_blank', text: `14. Local governments will need to adapt their strategies to handle new economic ______.`, correctAnswer: 'pressures' },
  { number: 15, type: 'fill_in_the_blank', text: `15. The ultimate goal of studying ${topic} is to improve scientific ______.`, correctAnswer: 'progress' }
];

// 2. EXACTLY 15 DISTINCT LISTENING QUESTIONS PER REAL AUDIO
const libraryQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What is required to open a new library account?', options: ['Passport', 'Student ID', 'Utility Bill', 'Driver License'], correctAnswer: 'Student ID' },
  { number: 2, type: 'fill_in_the_blank', text: '2. The maximum number of books you can borrow is ______.', correctAnswer: 'five' },
  { number: 3, type: 'multiple_choice', text: '3. How much is the fine for a late return?', options: ['$1 per day', '$2 per day', '$5 flat fee', 'No fine'], correctAnswer: '$2 per day' },
  { number: 4, type: 'fill_in_the_blank', text: '4. The quiet study area is located on the ______ floor.', correctAnswer: 'second' },
  { number: 5, type: 'multiple_choice', text: '5. When does the library close on weekends?', options: ['5:00 PM', '8:00 PM', '10:00 PM', 'Midnight'], correctAnswer: '5:00 PM' },
  { number: 6, type: 'fill_in_the_blank', text: '6. To use the computers, you must sign in at the ______.', correctAnswer: 'desk' },
  { number: 7, type: 'multiple_choice', text: '7. Which section was recently renovated?', options: ['Childrens books', 'Reference', 'Archives', 'Cafeteria'], correctAnswer: 'Reference' },
  { number: 8, type: 'fill_in_the_blank', text: '8. You can reserve a study room up to a ______ in advance.', correctAnswer: 'week' },
  { number: 9, type: 'multiple_choice', text: '9. What happens if you lose a book?', options: ['Pay full price', 'Buy a replacement', 'Lose membership', 'Both A and B'], correctAnswer: 'Pay full price' },
  { number: 10, type: 'fill_in_the_blank', text: '10. The password for the Wi-Fi is updated every ______.', correctAnswer: 'month' },
  { number: 11, type: 'multiple_choice', text: '11. Where are the printers located?', options: ['Near the entrance', 'Next to the stairs', 'In the basement', 'Behind the desk'], correctAnswer: 'Next to the stairs' },
  { number: 12, type: 'fill_in_the_blank', text: '12. The library is closed on public ______.', correctAnswer: 'holidays' },
  { number: 13, type: 'multiple_choice', text: '13. Who can access the rare books archive?', options: ['Anyone', 'Undergraduates', 'Postgraduates only', 'Staff only'], correctAnswer: 'Postgraduates only' },
  { number: 14, type: 'fill_in_the_blank', text: '14. Audiobooks can be downloaded via the library ______.', correctAnswer: 'app' },
  { number: 15, type: 'multiple_choice', text: '15. What event happens every Tuesday?', options: ['Book club', 'Author signing', 'IT workshop', 'Movie screening'], correctAnswer: 'Book club' }
];

const museumQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What time does the guided tour begin?', options: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM'], correctAnswer: '10:00 AM' },
  { number: 2, type: 'fill_in_the_blank', text: '2. Photography is strictly prohibited in the ______ exhibit.', correctAnswer: 'egyptian' },
  { number: 3, type: 'multiple_choice', text: '3. Where should visitors leave their backpacks?', options: ['Cloakroom', 'Reception', 'Cafeteria', 'On the bus'], correctAnswer: 'Cloakroom' },
  { number: 4, type: 'fill_in_the_blank', text: '4. The museum was founded in the year ______.', correctAnswer: '1895' },
  { number: 5, type: 'multiple_choice', text: '5. Which exhibit is temporary?', options: ['Dinosaur bones', 'Modern Art', 'Roman coins', 'Space exploration'], correctAnswer: 'Modern Art' },
  { number: 6, type: 'fill_in_the_blank', text: '6. The gift shop is located next to the main ______.', correctAnswer: 'exit' },
  { number: 7, type: 'multiple_choice', text: '7. How long does the tour typically last?', options: ['45 minutes', '1 hour', '90 minutes', '2 hours'], correctAnswer: '90 minutes' },
  { number: 8, type: 'fill_in_the_blank', text: '8. Please do not touch the ______ on display.', correctAnswer: 'artifacts' },
  { number: 9, type: 'multiple_choice', text: '9. What is the theme of the south wing?', options: ['Technology', 'Natural History', 'Aviation', 'Local folklore'], correctAnswer: 'Natural History' },
  { number: 10, type: 'fill_in_the_blank', text: '10. Students can get a discount if they show their ______.', correctAnswer: 'card' },
  { number: 11, type: 'multiple_choice', text: '11. What is included in the premium ticket?', options: ['Free lunch', 'Audio guide', 'Souvenir', 'Parking'], correctAnswer: 'Audio guide' },
  { number: 12, type: 'fill_in_the_blank', text: '12. The interactive screens are currently out of ______.', correctAnswer: 'order' },
  { number: 13, type: 'multiple_choice', text: '13. Who donated the diamond collection?', options: ['A local family', 'The government', 'A foreign king', 'An anonymous donor'], correctAnswer: 'A local family' },
  { number: 14, type: 'fill_in_the_blank', text: '14. The cafe is located on the ______ floor.', correctAnswer: 'top' },
  { number: 15, type: 'multiple_choice', text: '15. Where is the meeting point if you get lost?', options: ['Fountain', 'Entrance desk', 'Statue', 'Restrooms'], correctAnswer: 'Fountain' }
];

const researchQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What is the main objective of the research project?', options: ['Analyze water quality', 'Study bird migration', 'Measure pollution', 'Test solar panels'], correctAnswer: 'Measure pollution' },
  { number: 2, type: 'fill_in_the_blank', text: '2. The deadline for the first draft is next ______.', correctAnswer: 'friday' },
  { number: 3, type: 'multiple_choice', text: '3. Who is the lead supervisor for this assignment?', options: ['Dr. Smith', 'Prof. Johnson', 'Dr. Lee', 'Ms. Davis'], correctAnswer: 'Dr. Smith' },
  { number: 4, type: 'fill_in_the_blank', text: '4. The students must collect samples from the ______.', correctAnswer: 'river' },
  { number: 5, type: 'multiple_choice', text: '5. How many people should be in each group?', options: ['Two', 'Three', 'Four', 'Five'], correctAnswer: 'Three' },
  { number: 6, type: 'fill_in_the_blank', text: '6. All data must be entered into the shared ______.', correctAnswer: 'spreadsheet' },
  { number: 7, type: 'multiple_choice', text: '7. What software will they use for analysis?', options: ['Excel', 'SPSS', 'Python', 'Tableau'], correctAnswer: 'SPSS' },
  { number: 8, type: 'fill_in_the_blank', text: '8. The final presentation will count for ______ percent of the grade.', correctAnswer: 'forty' },
  { number: 9, type: 'multiple_choice', text: '9. What should students do if equipment breaks?', options: ['Fix it', 'Buy a new one', 'Report it immediately', 'Ignore it'], correctAnswer: 'Report it immediately' },
  { number: 10, type: 'fill_in_the_blank', text: '10. The lab is open until ______ PM on weekdays.', correctAnswer: 'nine' },
  { number: 11, type: 'multiple_choice', text: '11. Which chapter of the textbook is most relevant?', options: ['Chapter 3', 'Chapter 5', 'Chapter 7', 'Chapter 9'], correctAnswer: 'Chapter 5' },
  { number: 12, type: 'fill_in_the_blank', text: '12. Students must wear safety ______ at all times in the lab.', correctAnswer: 'goggles' },
  { number: 13, type: 'multiple_choice', text: '13. Where will the final presentations be held?', options: ['Room 101', 'Main Hall', 'Library', 'Science Block'], correctAnswer: 'Room 101' },
  { number: 14, type: 'fill_in_the_blank', text: '14. You need to include at least ten academic ______.', correctAnswer: 'references' },
  { number: 15, type: 'multiple_choice', text: '15. What is the penalty for late submission?', options: ['5% deduction', '10% deduction', 'Zero marks', 'No penalty'], correctAnswer: '10% deduction' }
];

const lectureQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What specific branch of biology is the lecture about?', options: ['Genetics', 'Ecology', 'Cellular biology', 'Botany'], correctAnswer: 'Cellular biology' },
  { number: 2, type: 'fill_in_the_blank', text: '2. The nucleus is often referred to as the ______ of the cell.', correctAnswer: 'brain' },
  { number: 3, type: 'multiple_choice', text: '3. Which organelle produces energy?', options: ['Ribosome', 'Mitochondria', 'Vacuole', 'Golgi apparatus'], correctAnswer: 'Mitochondria' },
  { number: 4, type: 'fill_in_the_blank', text: '4. Plant cells have a rigid cell ______.', correctAnswer: 'wall' },
  { number: 5, type: 'multiple_choice', text: '5. What process was discovered in 1839?', options: ['Photosynthesis', 'Mitosis', 'Respiration', 'Osmosis'], correctAnswer: 'Mitosis' },
  { number: 6, type: 'fill_in_the_blank', text: '6. The professor mentioned an experiment involving ______.', correctAnswer: 'mice' },
  { number: 7, type: 'multiple_choice', text: '7. What is the main function of chloroplasts?', options: ['Storage', 'Energy conversion', 'Reproduction', 'Defense'], correctAnswer: 'Energy conversion' },
  { number: 8, type: 'fill_in_the_blank', text: '8. Human DNA is primarily stored in the ______.', correctAnswer: 'nucleus' },
  { number: 9, type: 'multiple_choice', text: '9. Who first observed cells under a microscope?', options: ['Newton', 'Darwin', 'Hooke', 'Pasteur'], correctAnswer: 'Hooke' },
  { number: 10, type: 'fill_in_the_blank', text: '10. The upcoming midterm will focus on chapters one through ______.', correctAnswer: 'four' },
  { number: 11, type: 'multiple_choice', text: '11. What liquid makes up most of the cytoplasm?', options: ['Acid', 'Water', 'Protein', 'Lipids'], correctAnswer: 'Water' },
  { number: 12, type: 'fill_in_the_blank', text: '12. Mutations occur when there is an error in the ______.', correctAnswer: 'dna' },
  { number: 13, type: 'multiple_choice', text: '13. How do single-celled organisms reproduce?', options: ['Meiosis', 'Binary fission', 'Budding', 'All of the above'], correctAnswer: 'Binary fission' },
  { number: 14, type: 'fill_in_the_blank', text: '14. The membrane is semi-______.', correctAnswer: 'permeable' },
  { number: 15, type: 'multiple_choice', text: '15. What is the topic for next week’s lecture?', options: ['Viruses', 'Bacteria', 'Fungi', 'Evolution'], correctAnswer: 'Viruses' }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB. Wiping old collections completely...');
    
    // Safely drop all collections
    try { await ReadingTest.collection.drop(); } catch(e){}
    try { await ListeningTest.collection.drop(); } catch(e){}
    try { await WritingTest.collection.drop(); } catch(e){}
    try { await SpeakingTest.collection.drop(); } catch(e){}

    const allTopics = [
      "Global Trade", "Renewable Energy", "Deep Sea Exploration", "Roman Architecture", "Cognitive Psychology", 
      "AI in Healthcare", "Climate Change", "Language Evolution", "Quantum Computing", "Space Colonization",
      "Music Psychology", "Agriculture History", "Nanotechnology", "Urban Planning", "Bird Migration",
      "Cryptocurrency", "Renaissance Art", "Neuroplasticity", "Desert Ecosystems", "Industrial Revolution"
    ];

    // --- 1. GENERATE 20 READING TESTS ---
    const readingTests = allTopics.map((topic, i) => ({
      title: `Academic Reading Test ${i + 1}: ${topic}`,
      sections: [{
        title: `Passage 1: A Deep Dive into ${topic}`,
        passage: `<p>This comprehensive academic text investigates the fascinating domain of <b>${topic}</b>. Over the last century, scholars have thoroughly debated the foundational mechanisms of this field. Initial theories suggested that early progress was purely accidental, but recent archaeological and data-driven discoveries indicate a highly structured approach by our ancestors.</p><br/><p>As we move into the modern era, the implications of ${topic} are becoming exponentially more critical to global sustainability and scientific progress. The next decade will likely see an unprecedented surge in related funding and research, drastically changing how local governments respond to economic pressures.</p>`,
        questions: getReadingQs(topic)
      }]
    }));
    await ReadingTest.insertMany(readingTests);

    // --- 2. GENERATE 20 LISTENING TESTS (USING YOUR REAL AUDIOS) ---
    // We cycle through your 4 uploaded audio files and pair them with their matching questions!
    const listeningDataSources = [
      { context: 'Library Registration', url: '/public/Librarian audio.mp3', qs: libraryQuestions },
      { context: 'Biology Lecture', url: '/public/Lecture audio.mp3', qs: lectureQuestions },
      { context: 'Research Meeting', url: '/public/Research project.mp3', qs: researchQuestions },
      { context: 'Museum Tour', url: '/public/museum audio.mp3', qs: museumQuestions }
    ];

    const listeningTests = Array.from({ length: 20 }, (_, i) => {
      const template = listeningDataSources[i % 4];
      return {
        title: `Listening Mock Test ${i + 1}: ${template.context}`,
        sections: [{ audioUrl: template.url, questions: template.qs }]
      };
    });
    await ListeningTest.insertMany(listeningTests);

    // --- 3. GENERATE 20 WRITING TESTS (FIXED PROMPTS & UNIQUE CHARTS) ---
    const writingTests = allTopics.map((topic, i) => {
      // Create a visually distinct chart with random numbers for each test
      const chartConfig = {
        type: 'bar',
        data: {
          labels: ['2010', '2015', '2020'],
          datasets: [
            { label: 'USA', data: [Math.floor(Math.random()*100), Math.floor(Math.random()*100), Math.floor(Math.random()*100)] },
            { label: 'UK', data: [Math.floor(Math.random()*100), Math.floor(Math.random()*100), Math.floor(Math.random()*100)] }
          ]
        },
        options: { title: { display: true, text: `${topic} Trends` } }
      };
      
      const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=500&h=300`;

      return {
        title: `Academic Writing Test ${i + 1}: ${topic}`,
        task1: {
          // Removed <b> tags, used plain text so it looks clean
          prompt: `Instructions: You should spend about 20 minutes on this task.\n\nThe chart below shows the changes in ${topic} across two countries between 2010 and 2020.\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.`,
          minWords: 150,
          imageUrl: chartUrl
        },
        task2: {
          prompt: `Instructions: You should spend about 40 minutes on this task.\n\nMany people argue that issues surrounding ${topic.toLowerCase()} are the most urgent of our time. To what extent do you agree?\n\nGive reasons for your answer and include relevant examples from your own knowledge.`,
          minWords: 250
        }
      };
    });
    await WritingTest.insertMany(writingTests);

    // --- 4. GENERATE 20 SPEAKING TESTS ---
    const speakingTests = allTopics.map((topic, i) => ({
      title: `Speaking Interview ${i + 1}: ${topic}`,
      part1: { questions: [`Welcome to the speaking test. Let's talk about ${topic}.`, `Do you generally enjoy ${topic}?`, `How has your view on ${topic} changed recently?`] },
      part2: { cueCard: `Describe a memorable experience you had relating to ${topic}.\n\nYou should say:\n- What happened\n- When and where it happened\n- Who you were with\n\nAnd explain why it was memorable.` },
      part3: { questions: [`What is the broader impact of ${topic} on society today?`, `How do you think ${topic} will evolve in 50 years?`] }
    }));
    await SpeakingTest.insertMany(speakingTests);

    console.log('✅ SUCCESS! The database is now filled with 80 completely robust tests.');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();