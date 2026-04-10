const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const snippetRoutes = require('./routes/snippets');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`CodeSnap server running on port ${PORT}`);
});