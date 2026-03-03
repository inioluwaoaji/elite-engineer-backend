// server.js - Clean version with real Gemini call, no strict validation

require('dotenv').config(); // for local .env testing

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors());
app.use(express.json());

// Health check (what you see when you open the URL in browser)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend is running',
    endpoint: 'POST /api/generate-pdf',
    example: {
      name: "Test User",
      legal_anchor: "Nigerian Constitution Section 35"
    }
  });
});

// Main endpoint
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { name, legal_anchor } = req.body;

    // Very basic checks only
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: "Missing or invalid name" });
    }
    if (!legal_anchor || typeof legal_anchor !== 'string' || legal_anchor.trim() === '') {
      return res.status(400).json({ error: "Missing or invalid legal_anchor" });
    }

    const cleanName = name.trim();
    const cleanAnchor = legal_anchor.trim();

    // Log key status (for debugging)
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY status:", apiKey ? "SET" : "MISSING");

    if (!apiKey) {
      return res.status(500).json({ error: "Server missing Gemini API key" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a legal expert in Nigerian and Fijian law.
Give a short, clear analysis for:

Person: ${cleanName}
Legal reference: ${cleanAnchor}

Include:
1. What the provision says (key points)
2. How it applies
3. Possible outcomes
4. One recommendation

Keep it professional and under 300 words.
`;

    console.log("Sending prompt to Gemini...");

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    return res.status(200).json({
      success: true,
      name: cleanName,
      legal_anchor: cleanAnchor,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("ERROR:", err.message);
    console.error("Full error:", err);

    return res.status(500).json({
      error: "Failed to generate response",
      details: err.message || "Unknown error"
    });
  }
});

// Catch unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});