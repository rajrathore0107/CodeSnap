require('dotenv').config();
const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const axios = require('axios');

async function callGemini(prompt) {
  try {
    console.log("🧠 Sending prompt to Gemini...");

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const data = await response.json();

    console.log("🔥 FULL GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API failed');
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini');
    }

    return data.candidates[0]?.content?.parts?.[0]?.text || 'No text returned';

  } catch (err) {
    console.error("❌ Gemini ERROR:", err.message);
    throw err;
  }
}

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