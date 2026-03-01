# IELTS Prep Server

Backend API for IELTS preparation app using Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
MONGODB_URI=mongodb://127.0.0.1:27017/ielts_prep
PORT=5000
```

3. Seed the database:
```bash
npm run seed
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/reading` - Get reading test data
- `GET /api/listening` - Get listening test data
- `GET /api/writing` - Get writing test data
- `GET /api/speaking` - Get speaking test data
