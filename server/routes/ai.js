require('dotenv').config();
const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

router.use(authMiddleware);

router.post('/explain', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    const prompt = `Explain this ${language} code simply and clearly, step by step:\n\n${code}`;
    const explanation = await callGemini(prompt);
    res.json({ explanation });
  } catch (error) {
    console.error('Gemini error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post('/improve', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    const prompt = `Review this ${language} code and suggest improvements. Show the improved version:\n\n${code}`;
    const suggestions = await callGemini(prompt);
    res.json({ suggestions });
  } catch (error) {
    console.error('Gemini error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { description, language } = req.body;
    if (!description) return res.status(400).json({ message: 'Description is required' });

    const prompt = `Write ${language} code for: ${description}. Return only the code, no explanation.`;
    const text = await callGemini(prompt);
    const code = text.replace(/```[\w]*/g, '').replace(/```/g, '').trim();
    res.json({ code });
  } catch (error) {
    console.error('Gemini error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;