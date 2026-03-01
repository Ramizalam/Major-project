require('dotenv').config();
const mongoose = require('mongoose');
const ReadingTest = require('./models/ReadingTest');
const ListeningTest = require('./models/ListeningTest');
const WritingTest = require('./models/WritingTest');
const SpeakingTest = require('./models/SpeakingTest');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: 'ielts_prep' });

  console.log('Connected to MongoDB, seeding data...');

  // READING DATA (from client/src/components/ReadingModule.tsx)
  const readingDoc = {
    passages: [
      {
        title: 'The Evolution of Urban Planning',
        text: `Modern urban planning has undergone significant transformations over the past century. What began as simple grid systems in the early 1900s has evolved into complex, sustainable city designs that prioritize both human welfare and environmental protection.

The Industrial Revolution marked a turning point in urban development. Cities grew rapidly, but this growth came with challenges: overcrowding, pollution, and inadequate infrastructure. Urban planners of the early 20th century, such as Daniel Burnham and Frederick Law Olmsted, recognized the need for comprehensive city planning that would address these issues.

One of the most influential movements was the Garden City concept, introduced by Ebenezer Howard in 1898. This approach aimed to combine the benefits of city and country living by creating self-contained communities surrounded by greenbelts. The idea was to limit urban sprawl while providing residents with access to both urban amenities and natural spaces.

The mid-20th century saw the rise of modernist planning, characterized by large-scale housing projects and car-centric design. However, critics like Jane Jacobs argued that such approaches ignored the social fabric of communities and the importance of mixed-use development.

Today's urban planning emphasizes sustainability, walkability, and community engagement. Smart city technologies are being integrated to improve efficiency and quality of life. Cities are now designed with climate change in mind, incorporating green infrastructure, renewable energy systems, and resilient design principles.

The future of urban planning will likely involve even greater integration of technology, more participatory planning processes, and innovative solutions to address growing populations and environmental challenges.`,
        questions: 10,
      },
      {
        title: 'Artificial Intelligence in Healthcare',
        text: `Artificial Intelligence (AI) is revolutionizing healthcare delivery and patient outcomes across the globe. From diagnostic imaging to drug discovery, AI applications are transforming how medical professionals work and how patients receive care.

In diagnostic imaging, AI algorithms can now detect abnormalities in medical scans with accuracy that rivals or exceeds human specialists. Machine learning models trained on thousands of images can identify early-stage cancers, cardiovascular diseases, and neurological conditions that might be missed by the human eye. This capability is particularly valuable in regions with shortages of specialist radiologists.

Drug discovery, traditionally a process taking decades and costing billions of dollars, is being accelerated through AI. Researchers use machine learning to predict how different compounds will interact with biological targets, significantly reducing the time needed to identify promising drug candidates. Some pharmaceutical companies report reducing drug discovery timelines from years to months.

Personalized medicine is another area where AI is making significant strides. By analyzing genetic data, medical histories, and lifestyle factors, AI systems can predict individual patient responses to treatments and recommend personalized therapeutic approaches. This precision medicine approach improves treatment effectiveness while reducing adverse reactions.

However, the integration of AI in healthcare faces several challenges. Data privacy concerns are paramount, as medical records contain highly sensitive information. There are also questions about algorithmic bias, transparency in decision-making, and the potential for over-reliance on technology.

Regulatory frameworks are still developing to ensure AI medical devices meet safety and efficacy standards. Healthcare professionals need training to effectively integrate AI tools into their practice while maintaining the human touch that is essential to patient care.

Despite these challenges, the potential benefits of AI in healthcare are immense. As technology continues to advance and regulatory frameworks mature, AI will likely become an indispensable tool in modern medicine.`,
        questions: 13,
      },
      {
        title: 'Climate Change and Global Food Security',
        text: `Climate change poses one of the most significant threats to global food security in the 21st century. Rising temperatures, changing precipitation patterns, and extreme weather events are already affecting agricultural productivity worldwide, with implications for billions of people who depend on farming for their livelihoods and food security.

Temperature increases affect crop yields in complex ways. While some regions may benefit from longer growing seasons and increased CO2 concentrations, many major agricultural areas face declining productivity. Heat stress reduces the yields of staple crops like wheat, rice, and maize. In tropical regions, temperatures are approaching or exceeding the thermal tolerance of many crops.

Water availability is becoming increasingly unpredictable. Drought conditions are intensifying in many regions, while others experience more frequent flooding. Both extremes damage crops and reduce yields. Changes in rainfall patterns also affect the timing of planting and harvesting, disrupting traditional farming cycles that have been refined over generations.

Sea-level rise threatens coastal agricultural areas through saltwater intrusion, which makes soil unsuitable for most crops. Small island states and low-lying coastal regions are particularly vulnerable, with some areas already experiencing permanent loss of agricultural land.

The impacts are not evenly distributed globally. Developing countries, particularly those in sub-Saharan Africa and parts of Asia, face the greatest risks. These regions often have limited adaptive capacity due to poverty, inadequate infrastructure, and reliance on rain-fed agriculture.

Adaptation strategies are being developed and implemented worldwide. These include developing climate-resilient crop varieties, improving water management systems, and diversifying agricultural practices. Precision agriculture technologies help farmers optimize inputs and reduce waste. Some farmers are shifting to crops better suited to changing conditions.

However, adaptation alone may not be sufficient. Mitigation efforts to reduce greenhouse gas emissions are crucial to limit the severity of climate impacts. Agriculture itself is both a victim and a contributor to climate change, responsible for significant greenhouse gas emissions through livestock production, rice cultivation, and deforestation.

International cooperation is essential to address these challenges. Technology transfer, financial support for adaptation measures, and coordinated research efforts are all necessary components of a global response to climate change and food security challenges.`,
        questions: 14,
      },
    ],
    correctAnswers: [
      // Passage 1 (1-10)
      'C', 'B', 'D', 'D', 'B', 'C', 'C', 'B', 'B', 'C',
      // Passage 2 (11-25)
      'B', 'B', 'B', 'C', 'B', 'C', 'B', 'C', 'C', 'C', 'B', 'B', 'B', 'A', 'C',
      // Passage 3 (26-40)
      'B', 'C', 'B', 'B', 'B', 'B', 'B', 'B', 'C', 'B', 'B', 'C', 'A', 'B', 'B'
    ],
    questionTexts: new Map(Object.entries({
      1: [
        'What was the main characteristic of early 1900s urban planning?',
        'What major event led to rapid urban growth and new planning challenges?',
        'Which of the following was not a problem caused by rapid urban growth during the Industrial Revolution?',
        'Who introduced the Garden City concept?',
        'What was the main goal of the Garden City concept?',
        'What characterized modernist planning in the mid-20th century?',
        'Who criticized modernist urban planning for ignoring community life?',
        'What is a key focus of today\'s urban planning?',
        'Which of the following is an example of a modern urban planning feature?',
        'What does the passage suggest about the future of urban planning?'

      ],
      2: [
        'What is the main idea of the passage?',
        'In which area of healthcare is AI being used to detect abnormalities?',
        'What can AI algorithms detect in medical scans?',
        'Why is AI particularly useful in diagnostic imaging in some regions?',
        'How does AI help in drug discovery?',
        'Traditionally, drug discovery used to take:',
        'With AI, some pharmaceutical companies have reduced drug discovery timelines from:',
        'What is the focus of personalized medicine?',
        'Which type of data is analyzed in personalized medicine?',
        'What is one major benefit of personalized medicine using AI?',
        'What is one challenge mentioned regarding AI in healthcare?',
        'What is "algorithmic bias" in the context of AI healthcare?',
        'Why are regulatory frameworks important in AI healthcare?',
        'What do healthcare professionals need to effectively use AI tools?',
        'What is the passage\'s final outlook on AI in healthcare?'
      ],
      3: [
        'What is the main idea of the passage?',
        'Which of the following is not mentioned as an effect of climate change on agriculture?',
        'How do rising temperatures affect crop yields?',
        'Which staple crops are specifically mentioned as being affected by heat stress?',
        'What happens in tropical regions due to rising temperatures?',
        'How is water availability changing according to the passage?',
        'What effect does unpredictable rainfall have on farming?',
        'How does sea-level rise threaten agriculture?',
        'Which regions are most vulnerable to sea-level rise?',
        'Which areas face the greatest risk from climate impacts on agriculture?',
        'Why are these developing regions more vulnerable?',
        'Which of the following is not an adaptation strategy mentioned in the passage?',
        'What role does precision agriculture play?',
        'Why is mitigation important in addition to adaptation?',
        'What does the passage suggest as essential for addressing food security challenges?'
      ]
    })),
    questionOptions: new Map(Object.entries({
      1: [
        ['Sustainable city designs', 'Smart city technologies', 'Simple grid systems', 'Green infrastructure'],
        ['World War I', 'The Industrial Revolution', 'The Renaissance', 'The Green Revolution'],
        ['Overcrowding', 'Pollution', 'Inadequate infrastructure', 'Advanced transportation systems'],
        ['Daniel Burnham', 'Frederick Law Olmsted', 'Jane Jacobs', 'Ebenezer Howard'],
        ['To promote industrial development', 'To combine city and country living', 'To expand urban sprawl', 'To increase car usage'],
        ['Greenbelts and self-contained communities', 'Small-scale housing and pedestrian areas', 'Large-scale housing projects and car-centric design', 'Renewable energy systems'],
        ['Daniel Burnham', 'Ebenezer Howard', 'Jane Jacobs', 'Frederick Law Olmsted'],
        ['Industrial growth', 'Walkability and sustainability', 'Expansion of highways', 'High-rise development'],
        ['Car-centric layouts', 'Smart city technologies', 'Isolated housing projects', 'Factory-centered cities'],
        ['It will reduce technology use', 'It will focus only on rural areas', 'It will involve more technology and community participation', 'It will return to grid-based designs']
      ],
      2: [
        ['AI is replacing doctors in hospitals', 'AI is transforming healthcare delivery and patient outcomes', 'AI is mainly used for entertainment', 'AI is reducing the number of healthcare workers'],
        ['Surgery', 'Diagnostic imaging', 'Nursing', 'Dentistry'],
        ['Only skin diseases', 'Early-stage cancers and cardiovascular diseases', 'Only fractures', 'Emotional conditions'],
        ['Because it is cheaper than traditional machines', 'Because it replaces nurses', 'Because of a shortage of specialist radiologists', 'Because it does not require electricity'],
        ['By manufacturing drugs faster', 'By predicting how compounds interact with biological targets', 'By marketing drugs to hospitals', 'By reducing drug side effects directly'],
        ['A few weeks', 'A few months', 'Decades and billions of dollars', 'Only one year'],
        ['Days to hours', 'Years to months', 'Centuries to decades', 'Months to days'],
        ['Providing the same treatment to all patients', 'Using AI to create generic drugs', 'Tailoring treatment based on individual patient data', 'Reducing the number of doctors'],
        ['Only medical histories', 'Only genetic data', 'Genetic data, medical histories, and lifestyle factors', 'Hospital management data'],
        ['Reducing hospital visits', 'Increasing drug prices', 'Improving treatment effectiveness and reducing adverse reactions', 'Eliminating the need for human doctors'],
        ['Too many radiologists', 'Data privacy concerns', 'Lack of funding for AI research', 'Poor internet connectivity'],
        ['The tendency of AI to prefer human doctors', 'Errors in AI decisions due to biased training data', 'A type of medical treatment', 'A new diagnostic tool'],
        ['They make AI devices cheaper', 'They ensure AI medical devices are safe and effective', 'They promote competition among doctors', 'They increase hospital profits'],
        ['Training', 'New hospital buildings', 'Government funding', 'More patients'],
        ['AI will replace all medical professionals', 'AI\'s benefits are limited and temporary', 'AI will become an indispensable tool in modern medicine', 'AI should be banned due to ethical issues']
      ],
      3: [
        ['Climate change only affects coastal regions', 'Climate change is a major threat to global food security', 'Agriculture no longer depends on climate', 'Farming practices are identical worldwide'],
        ['Rising temperatures', 'Changing rainfall patterns', 'Improved soil fertility everywhere', 'Extreme weather events'],
        ['They always increase crop production', 'They have complex effects; some areas gain while others lose productivity', 'They have no effect on agriculture', 'They improve only tropical crops'],
        ['Corn, beans, and potatoes', 'Wheat, rice, and maize', 'Cotton, coffee, and sugarcane', 'Apples, bananas, and grapes'],
        ['Crops grow faster and stronger', 'Crops exceed their thermal tolerance', 'Rainfall increases evenly', 'New crops are easily introduced'],
        ['Rainfall has become more predictable', 'Droughts and floods are both becoming more frequent', 'All regions are getting more rainfall', 'Rivers are freezing more often'],
        ['It improves crop diversity', 'It disrupts traditional planting and harvesting cycles', 'It encourages farmers to use more fertilizers', 'It increases the size of farms'],
        ['By reducing sunlight for crops', 'Through saltwater intrusion into farmland', 'By cooling the oceans', 'By increasing crop pollination'],
        ['Mountain regions', 'Polar regions', 'Small island states and low-lying coastal areas', 'Desert regions'],
        ['Developed countries', 'Developing countries in sub-Saharan Africa and parts of Asia', 'Northern Europe', 'North America'],
        ['They have too much technology', 'They rely heavily on rain-fed agriculture and lack infrastructure', 'They grow only one crop type', 'They export most of their food'],
        ['Developing climate-resilient crops', 'Diversifying farming practices', 'Building more urban areas', 'Improving water management systems'],
        ['It helps farmers optimize inputs and reduce waste', 'It increases fertilizer dependency', 'It limits crop rotation', 'It replaces all manual labor'],
        ['It focuses only on economic growth', 'It reduces greenhouse gas emissions to limit climate change severity', 'It eliminates all agricultural risks', 'It ensures equal food distribution'],
        ['National isolation', 'International cooperation and technology sharing', 'Reducing scientific research', 'Relying solely on local farmers']
      ]
    }))
  };

  // LISTENING DATA (from client/src/components/ListeningModule.tsx)
  const listeningDoc = {
    sections: [
      { title: 'Section 1 - Social Context', description: 'Conversation between a student and librarian about joining the library', questions: '1-10' },
      { title: 'Section 2 - General Interest', description: 'Monologue about a local museum and its facilities', questions: '11-20' },
      { title: 'Section 3 - Academic Context', description: 'Discussion between students and tutor about a research project', questions: '21-30' },
      { title: 'Section 4 - Academic Lecture', description: 'Lecture about renewable energy and environmental impact', questions: '31-40' },
    ],
    correctAnswers: [
      'B', 'B', 'C', 'B', 'C', 'B', 'B', 'D', 'C', 'C',
      'B', 'C', 'C', 'B', 'D', 'A', 'B', 'B', 'C', 'C',
      'B', 'B', 'C', 'C', 'B', 'A', 'B', 'B', 'B', 'B',
      'B', 'B', 'B', 'C', 'A', 'B', 'B', 'C', 'B', 'A'
    ],
    questionTexts: new Map(Object.entries({
      1: [
        'What is the main purpose of the student\'s visit?',
        'What time does the library open on weekdays?',
        'What is the librarian\'s surname?',
        'What is the contact number for renewals?',
        'What type of discount is available?',
        'Which day is the library closed?',
        'What level computer course is recommended?',
        'Which activity is NOT available at the library?',
        'How many computers are in the study area?',
        'Where should visitors go for help?'
      ],
      2: [
        'What was the museum building originally used as?',
        'Where can visitors find the History Gallery?',
        'What is the theme of the current temporary exhibition?',
        'What can visitors buy at the souvenir shop?',
        'How many reference books are in the reading room?',
        'Who is allowed to borrow books from the reading room?',
        'How long does each guided tour last?',
        'On which day is the museum closed?',
        'How much does a student ticket cost?',
        'Where should visitors go if they need assistance?'
      ],
      3: [
        'What is the main topic of the students\' research project?',
        'Why did the students choose this topic?',
        'How do the students plan to collect data?',
        'What additional method does the tutor recommend?',
        'How many participants should they include in their research?',
        'What kind of data should the students collect?',
        'When is the first draft due?',
        'What referencing style should they use?',
        'When is the Writing Support Centre open?',
        'What advice does the tutor give at the end?'
      ],
      4: [
        'What does renewable energy mainly refer to?',
        'Which country benefits most from solar energy due to high sunlight exposure?',
        'What is a disadvantage of large solar farms?',
        'What is one environmental concern about wind energy?',
        'What negative impact can hydroelectric dams cause?',
        'Why is biomass energy considered less clean than other renewable sources?',
        'What environmental issue is related to producing solar panels?',
        'According to the lecture, renewable energy could reduce global CO₂ emissions by up to:',
        'What is one major benefit of renewable energy for countries?',
        'Which of the following is mentioned as a barrier to renewable energy adoption?'
      ]
    })),
    questionOptions: new Map(Object.entries({
      1: [
        ['To borrow a book', 'To join the library', 'To attend a workshop', 'To return late books'],
        ['8 a.m.', '9 a.m.', '10 a.m.', '11 a.m.'],
        ['Brown', 'Smith', 'Green', 'Taylor'],
        ['0425 678 921', '0425 678 912', '0245 678 912', '0425 687 912'],
        ['10% discount for seniors', 'Free membership for all', '25% discount for full-time students', '50% discount on books'],
        ['Saturday', 'Sunday', 'Monday', 'Friday'],
        ['Advanced Computer Programming - Level 3', 'Basic Computer Skills - Level 1', 'Intermediate Web Design - Level 2', 'Data Science - Level 4'],
        ['Book clubs', 'Art workshops', 'Language classes', 'Sports activities'],
        ['8', '10', '12', '15'],
        ['The café', 'The Security Office', 'The Information Desk', 'The Reading Room']
      ],
      2: [
        ['A library', 'A railway station', 'A school', 'A government office'],
        ['On the right of the main hall', 'Upstairs on the second floor', 'On the left of the main hall', 'Behind the café'],
        ['Riverdale architecture', 'Ancient artifacts', 'Women in Modern Art', 'Space exploration'],
        ['Antique jewelry', 'Postcards and crafts', 'Paintings by local artists', 'Second-hand books'],
        ['500', '1,000', '2,500', '5,000'],
        ['Members only', 'Everyone', 'Tourists', 'Students'],
        ['30 minutes', '45 minutes', '1 hour', '90 minutes'],
        ['Sunday', 'Monday', 'Tuesday', 'Saturday'],
        ['£10', '£8', '£6', 'Free'],
        ['The café', 'The ticket counter', 'The Information Desk', 'The souvenir shop']
      ],
      3: [
        ['The use of smartphones in education', 'The effect of social media on students\' study habits', 'The impact of group study on grades', 'The rise of online learning'],
        ['It\'s a popular research area', 'They noticed their classmates using social media while studying', 'Their tutor suggested it', 'It\'s easy to collect data for it'],
        ['Through interviews only', 'By reviewing articles', 'Using an online questionnaire', 'By conducting experiments'],
        ['Observations', 'Surveys of teachers', 'Conducting interviews', 'Reading journal articles'],
        ['20 to 30', '50 to 60', '70 to 80', 'Over 100'],
        ['Both quantitative and qualitative data', 'Only numerical data', 'Only interview data', 'Historical data'],
        ['At the end of this month', 'On the 15th of next month', 'Two weeks from now', 'June 30th'],
        ['APA', 'Harvard', 'MLA', 'Chicago'],
        ['Monday to Friday, 9 a.m. – 5 p.m.', 'Monday to Friday, 10 a.m. – 4 p.m.', 'Weekends only', 'Every day, 8 a.m. – 6 p.m.'],
        ['Focus on grammar and spelling', 'Keep questions clear, data reliable, and time managed', 'Use as many sources as possible', 'Finish early to get extra credit']
      ],
      4: [
        ['Energy produced from fossil fuels', 'Energy from natural sources that are constantly replenished', 'Energy generated only from water and wind', 'Energy that is stored in batteries'],
        ['Canada', 'India', 'Japan', 'Germany'],
        ['They create noise pollution', 'They take up a lot of land and may disturb habitats', 'They produce harmful gases', 'They are unreliable in all climates'],
        ['It causes water pollution', 'It releases carbon dioxide', 'It can harm birds and create noise', 'It destroys forests'],
        ['Flooding and displacement of people', 'Noise pollution', 'Depletion of groundwater', 'Radiation emissions'],
        ['It uses non-renewable materials', 'It releases carbon dioxide when burned', 'It depends heavily on weather conditions', 'It produces toxic waste'],
        ['Air pollution from factories', 'Mining rare materials that harm ecosystems', 'Waste from turbine blades', 'Oil leakage'],
        ['40% by 2030', '50% by 2040', '70% by 2050', '90% by 2060'],
        ['It increases reliance on oil imports', 'It improves energy security and independence', 'It lowers education costs', 'It reduces industrial growth'],
        ['High installation costs and storage issues', 'Lack of raw materials', 'Global population growth', 'Weak demand from industries']
      ]
    }))
  };

  // WRITING DATA (from client/src/components/WritingModule.tsx)
  const writingDoc = {
    task1: {
      title: 'Writing Task 1',
      time: '20 minutes',
      wordCount: 150,
      instructions:
        'The chart shows the percentage of households with different types of internet connections in three countries from 2010 to 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      chartDescription:
        'Internet Connection Types by Country (2010-2020). Broadband and Mobile Internet trends for Country A, B, C.',
    },
    task2: {
      title: 'Writing Task 2',
      time: '40 minutes',
      wordCount: 250,
      question:
        'Many people believe that social media has had a negative impact on society, particularly on young people. Others argue that social media has brought significant benefits to communication and information sharing. Discuss both views and give your own opinion.',
      tips: [
        'Present both sides of the argument clearly',
        'Give your own opinion and support it',
        'Use specific examples where possible',
        'Organize your essay with clear paragraphs',
        'Write a strong conclusion',
      ],
    },
  };

  // SPEAKING DATA (from client/src/components/SpeakingModule.tsx)
  const speakingDoc = {
    parts: [
      {
        title: 'Part 1 - Introduction and Interview',
        duration: '4-5 minutes',
        description: 'General questions about yourself, your life, and familiar topics',
        questions: [
          'What is your full name?',
          'Where are you from?',
          'Do you work or are you a student?',
          'What do you like about your job/studies?',
          'Do you enjoy reading books? Why or why not?',
          'What kind of books do you prefer?',
          'How has your reading habit changed over the years?',
        ],
      },
      {
        title: 'Part 2 - Individual Long Turn',
        duration: '3-4 minutes',
        description: 'Speak for 1-2 minutes on a given topic after 1 minute of preparation',
        questions: [
          `Describe a memorable journey you have taken.
          
You should say:
• Where you went
• Who you went with
• What you did during the journey
• And explain why this journey was memorable for you
          
You have 1 minute to prepare. You can make notes if you wish.`,
        ],
      },
      {
        title: 'Part 3 - Two-way Discussion',
        duration: '4-5 minutes',
        description: 'Abstract discussion related to Part 2 topic',
        questions: [
          'Why do you think people enjoy traveling?',
          'How has tourism changed in your country over the years?',
          'What are the benefits and drawbacks of international tourism?',
          'Do you think virtual travel experiences could replace real travel in the future?',
          'How important is it for young people to experience different cultures?',
        ],
      },
    ],
  };

  // Clear existing and insert fresh
  await ReadingTest.deleteMany({});
  await ListeningTest.deleteMany({});
  await WritingTest.deleteMany({});
  await SpeakingTest.deleteMany({});

  await ReadingTest.create(readingDoc);
  await ListeningTest.create(listeningDoc);
  await WritingTest.create(writingDoc);
  await SpeakingTest.create(speakingDoc);

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
