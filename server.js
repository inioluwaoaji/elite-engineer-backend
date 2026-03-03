// server.js - Updated March 2026 - uses gemini-1.5-flash-latest to fix 404 error

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend live',
    endpoint: 'POST /api/generate-pdf',
    example: { name: "Test", legal_anchor: "Nigerian Constitution Section 35" }
  });
});

// Main endpoint
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { name, legal_anchor } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: "Missing or invalid name" });
    }
    if (!legal_anchor || typeof legal_anchor !== 'string' || legal_anchor.trim() === '') {
      return res.status(400).json({ error: "Missing or invalid legal_anchor" });
    }

    const cleanName = name.trim();
    const cleanAnchor = legal_anchor.trim();

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY status:", apiKey ? "SET" : "MISSING");

    if (!apiKey) {
      return res.status(500).json({ error: "Server missing Gemini API key" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // FIXED MODEL NAME - use latest alias to avoid 404
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
You are a legal expert in Nigerian and Fijian law.
Provide a concise analysis for:

Person/Case: ${cleanName}
Legal provision: ${cleanAnchor}

Include:
1. Key points of the provision
2. How it applies
3. Possible outcomes
4. Short recommendation

Professional tone, under 300 words.
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

app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});