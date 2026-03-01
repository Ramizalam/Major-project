# Backend Setup Guide

## What We've Built

A complete Node.js/Express backend with MongoDB for the IELTS prep application.

### Backend Structure

```
server/
├── index.js                 # Express server entry point
├── package.json            # Dependencies
├── .env.example            # Environment variables template
├── models/                 # Mongoose schemas
│   ├── ReadingTest.js
│   ├── ListeningTest.js
│   ├── WritingTest.js
│   └── SpeakingTest.js
├── routes/                 # API endpoints
│   ├── reading.js
│   ├── listening.js
│   ├── writing.js
│   └── speaking.js
└── seed.js                 # Database seeding script
```

## Setup Instructions

### 1. Install MongoDB

**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment

Create `server/.env` file:
```
MONGODB_URI=mongodb://127.0.0.1:27017/ielts_prep
PORT=5000
```

### 4. Seed the Database

```bash
cd server
npm run seed
```

This will populate MongoDB with all the test data currently hardcoded in the client.

### 5. Start the Server

```bash
npm run dev
```

Server will run on http://localhost:5000

## API Endpoints

- `GET /api/reading` - Returns reading test passages, questions, and correct answers
- `GET /api/listening` - Returns listening test sections and correct answers
- `GET /api/writing` - Returns writing task prompts and instructions
- `GET /api/speaking` - Returns speaking test parts and questions

## Next Steps: Update Client Components

### For Each Component (Reading, Listening, Writing, Speaking):

1. **Add state for loading and data fetching**
2. **Fetch data from backend on component mount**
3. **Replace hardcoded data with fetched data**
4. **Add loading and error states to UI**

### Example for ReadingModule.tsx:

```typescript
// Add new state
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [passages, setPassages] = useState<any[]>([]);
const [correctAnswers, setCorrectAnswers] = useState<any[]>([]);
const [questionTexts, setQuestionTexts] = useState<Record<string, string[]>>({});

// Fetch data on mount
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/reading`);
      if (!res.ok) throw new Error('Failed to load data');
      const data = await res.json();
      
      setPassages(data.passages || []);
      setCorrectAnswers(data.correctAnswers || []);
      
      // Convert questionTexts Map to object
      const qt: Record<string, string[]> = {};
      if (data.questionTexts) {
        Object.keys(data.questionTexts).forEach((k) => {
          qt[k] = data.questionTexts[k];
        });
      }
      setQuestionTexts(qt);
    } catch (e: any) {
      setError(e.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

// Remove hardcoded passages and correctAnswers arrays

// Add loading/error UI
{loading && <div>Loading...</div>}
{error && <div className="text-red-600">{error}</div>}
{!loading && !error && passages.length > 0 && (
  // existing UI
)}
```

### Client Environment Variable

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

## Testing

1. Start MongoDB
2. Start backend: `cd server && npm run dev`
3. Start frontend: `cd client && npm run dev`
4. Test each module to ensure data loads from backend

## Production Deployment

1. **Backend**: Deploy to Heroku, Railway, Render, or AWS
2. **Database**: Use MongoDB Atlas for production
3. **Frontend**: Update `VITE_API_URL` to production backend URL
4. **CORS**: Update CORS settings in `server/index.js` for production domain

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### CORS Error
- Backend CORS is configured for all origins in development
- Update for production with specific frontend domain

### Port Already in Use
- Change PORT in `.env`
- Or kill process: `npx kill-port 5000`
