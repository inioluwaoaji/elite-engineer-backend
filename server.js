// server.js - Stable 2026 version
// Uses gemini-2.5-flash (current stable flash model)
// No validation, real Gemini call, detailed logging

require('dotenv').config(); // local .env support

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors());
app.use(express.json());

// Root health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Legal backend is live',
    endpoint: 'POST /api/generate-pdf',
    example: { name: "Test", legal_anchor: "Nigerian Constitution Section 35" },
    note: 'Any legal_anchor accepted'
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
      return res.status(500).json({ error: "Missing Gemini API key" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // FIXED: Use stable 2026 flash model - no -latest suffix
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("Model initialized - sending prompt...");

    const prompt = `
You are a legal expert in Nigerian and Fijian law.
Provide a concise analysis:

Person/Case: ${cleanName}
Legal provision: ${cleanAnchor}

Include:
1. Key points of the provision
2. How it applies
3. Possible outcomes
4. Short recommendation

Professional tone, under 300 words.
`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    console.log("Gemini response received");

    return res.status(200).json({
      success: true,
      name: cleanName,
      legal_anchor: cleanAnchor,
      analysis,
      generated_at: new Date().toISOString()
    });

  } catch (err) {
    console.error("ERROR in generate-pdf:", err.message);
    console.error("Full error:", err);

    return res.status(500).json({
      error: "Failed to generate analysis",
      details: err.message || "Unknown error"
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});