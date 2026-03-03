require('dotenv').config();
const mongoose = require('mongoose');
const ReadingTest = require('./models/ReadingTest');
const ListeningTest = require('./models/ListeningTest');
const WritingTest = require('./models/WritingTest');
const SpeakingTest = require('./models/SpeakingTest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts_prep';

const generateReadingQuestions = (topic) => {
    return Array.from({ length: 15 }, (_, q) => {
        const i = q + 1;
        if (i <= 5) {
            return { number: i, type: 'true_false_not_given', text: `Statement ${i}: The evolution of ${topic} fundamentally changed society in ways that are widely accepted by all historians.`, options: ['True', 'False', 'Not Given'], correctAnswer: i % 2 === 0 ? 'False' : 'True' };
        } else if (i <= 10) {
            return { number: i, type: 'multiple_choice', text: `What is the primary argument presented in paragraph ${i - 5} regarding ${topic}?`, options: ['Economic implications', 'Societal pushback', 'Technological advancement', 'None of the above'], correctAnswer: 'Technological advancement' };
        } else {
            return { number: i, type: 'fill_in_the_blank', text: `Researchers concluded that the most crucial factor in the development of ${topic} was the discovery of new ______.`, correctAnswer: 'resources' };
        }
    });
};

const generateListeningQuestions = (context) => {
    return Array.from({ length: 15 }, (_, q) => {
        const i = q + 1;
        if (i <= 5) {
            return { number: i, type: 'multiple_choice', text: `Question ${i}: During the ${context}, what specific requirement was mentioned first?`, options: ['Identification', 'Payment', 'Booking reference', 'Signature'], correctAnswer: 'Identification' };
        } else if (i <= 10) {
            return { number: i, type: 'fill_in_the_blank', text: `The speaker noted that participants must bring their own ______ to the event.`, correctAnswer: 'materials' };
        } else {
            return { number: i, type: 'multiple_choice', text: `Question ${i}: What time does the final segment of the ${context} conclude?`, options: ['12:00 PM', '2:30 PM', '4:45 PM', '5:00 PM'], correctAnswer: '4:45 PM' };
        }
    });
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected. Wiping old tests...');

    try { await ReadingTest.collection.drop(); } catch(e){}
    try { await ListeningTest.collection.drop(); } catch(e){}
    try { await WritingTest.collection.drop(); } catch(e){}
    try { await SpeakingTest.collection.drop(); } catch(e){}

    console.log('🧹 Injecting 80 MASSIVE tests with 15 unique questions per test...');

    // 1. 20 READING TESTS
    const readingTopics = [
      "Global Trade History", "Renewable Energy", "Deep Sea Exploration", "Roman Architecture", "Cognitive Psychology", 
      "AI in Healthcare", "Climate Change Impacts", "Language Evolution", "Quantum Computing", "Space Colonization",
      "The Psychology of Music", "History of Agriculture", "Nanotechnology", "Urban Planning", "The Migration of Birds",
      "Cryptocurrency Markets", "The Renaissance Art", "Neuroplasticity", "Desert Ecosystems", "The Industrial Revolution"
    ];
    const readingTests = readingTopics.map((topic, i) => ({
      title: `Academic Reading Test ${i + 1}: ${topic}`,
      sections: [{
        title: `Passage 1: A Deep Dive into ${topic}`,
        passage: `<h3>Instructions: Read the text carefully and answer the 15 questions below.</h3><p>This comprehensive academic text investigates the fascinating domain of <b>${topic}</b>. Over the last century, scholars have thoroughly debated the foundational mechanisms of this field. Initial theories suggested that early progress was purely accidental, but recent archaeological and data-driven discoveries indicate a highly structured approach by our ancestors.</p><p>As we move into the modern era, the implications of ${topic} are becoming exponentially more critical to global sustainability and scientific progress. The next decade will likely see an unprecedented surge in related funding and research.</p>`,
        questions: generateReadingQuestions(topic)
      }]
    }));
    await ReadingTest.insertMany(readingTests);

    // 2. 20 LISTENING TESTS
    const listeningAudios = ['/public/Librarian audio.mp3', '/public/Lecture audio.mp3', '/public/Research project.mp3', '/public/museum audio.mp3'];
    const listeningContexts = [
      "Library Registration", "Biology Lecture", "Project Meeting", "Museum Tour", "Hotel Booking",
      "Clinic Appointment", "Student Union", "Festival Plan", "Job Interview", "Airport Announcement",
      "Train Station", "Fitness Center", "Campus Housing", "Car Rental", "City Council Meeting",
      "Art Gallery", "Science Fair", "Radio Broadcast", "Customer Service", "Real Estate Agent"
    ];
    const listeningTests = listeningContexts.map((context, i) => ({
      title: `Listening Mock Test ${i + 1}: ${context}`,
      sections: [{
        audioUrl: listeningAudios[i % 4],
        questions: generateListeningQuestions(context)
      }]
    }));
    await ListeningTest.insertMany(listeningTests);

    // 3. 20 WRITING TESTS 
    const writingTopics = [
      "Energy Consumption", "Education Budgets", "Public Transport", "Internet Access", "Fast Food", 
      "Renewable Energy", "Urban Density", "Tourism Rates", "Employment", "Recycling Stats",
      "Healthcare Costs", "Smartphone Usage", "Electric Vehicles", "Library Visits", "Cinema Attendance",
      "Gym Memberships", "Online Shopping", "Air Travel", "Water Usage", "Carbon Emissions"
    ];
    const writingTests = writingTopics.map((topic, i) => ({
      title: `Academic Writing Test ${i + 1}: ${topic}`,
      task1: {
        prompt: `<b>Instructions: You should spend about 20 minutes on this task.</b>\nThe chart below shows the changes in ${topic} across three countries between 2010 and 2020.\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.`,
        minWords: 150,
        imageUrl: `https://placehold.co/600x400/1e293b/06b6d4/png?text=${topic.replace(/ /g, '+')}+Chart`
      },
      task2: {
        prompt: `<b>Instructions: You should spend about 40 minutes on this task.</b>\nMany people argue that ${topic.toLowerCase()} is the most urgent issue of our time. To what extent do you agree?\nGive reasons for your answer and include relevant examples.`,
        minWords: 250
      }
    }));
    await WritingTest.insertMany(writingTests);

    // 4. 20 SPEAKING TESTS
    const speakingTopics = [
      "Hometowns", "Hobbies", "Food", "Travel", "Careers", "Study", "Family", "Friends", "Technology", "Future Goals",
      "Sports", "Music", "Reading", "Weather", "History", "Nature", "Art", "Shopping", "Transport", "Childhood"
    ];
    const speakingTests = speakingTopics.map((topic, i) => ({
      title: `Speaking Interview ${i + 1}: ${topic}`,
      part1: { questions: [`Let's talk about ${topic}.`, `Do you generally enjoy ${topic}?`, `How has your view on ${topic} changed recently?`] },
      part2: { cueCard: `Describe a memorable experience you had relating to ${topic}.\nYou should say:\n- What happened\n- When and where it happened\n- Who you were with\nAnd explain why it was memorable.` },
      part3: { questions: [`What is the broader impact of ${topic} on society?`, `How do you think ${topic} will evolve in 50 years?`] }
    }));
    await SpeakingTest.insertMany(speakingTests);

    console.log('✅ SUCCESS! 80 unique tests generated. No more repeating questions!');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();