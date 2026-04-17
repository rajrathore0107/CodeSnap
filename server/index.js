const aiRoutes = require('./routes/ai');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const snippetRoutes = require('./routes/snippets');

const app = express();

// ✅ FIXED CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://code-snap-theta.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'CodeSnap API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`CodeSnap server running on port ${PORT}`);
});