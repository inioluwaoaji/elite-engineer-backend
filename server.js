// server.js — Stable final version (March 2026)
// No validation list, real Gemini call, fixed model name

require('dotenv').config(); // for local testing with .env file

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors());
app.use(express.json());

// Health check route (what you see in browser)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Legal backend is running',
    endpoint: 'POST /api/generate-pdf',
    example_body: {
      name: "Aisha Mohammed",
      legal_anchor: "Nigerian Constitution Section 35"
    },
    note: 'Any legal_anchor value is accepted — Gemini handles the analysis'
  });
});

// Main endpoint
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { name, legal_anchor } = req.body;

    // Very minimal input checks
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: "Missing or invalid 'name'" });
    }
    if (!legal_anchor || typeof legal_anchor !== 'string' || legal_anchor.trim() === '') {
      return res.status(400).json({ error: "Missing or invalid 'legal_anchor'" });
    }

    const cleanName = name.trim();
    const cleanAnchor = legal_anchor.trim();

    // Log key status (debug)
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY status:", apiKey ? "SET" : "MISSING");

    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error — missing API key" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // FIXED MODEL — this is the current working name in 2026
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    console.log("Sending prompt to Gemini...");

    const prompt = `
You are a legal expert in Nigerian and Fijian law.
Provide a concise, professional analysis for:

Person/Case: ${cleanName}
Legal provision/reference: ${cleanAnchor}

Include:
1. Summary of the provision's key points
2. How it typically applies
3. Possible implications or outcomes
4. One short recommendation

Keep under 350 words. No disclaimers.
`;

    const result = await model.generateContent(prompt);
    const analysisText = result.response.text();

    return res.status(200).json({
      success: true,
      name: cleanName,
      legal_anchor: cleanAnchor,
      analysis: analysisText,
      generated_at: new Date().toISOString()
    });

  } catch (err) {
    console.error("ERROR in /api/generate-pdf:", err.message);
    console.error("Full error details:", err);

    return res.status(500).json({
      error: "Failed to generate legal analysis",
      details: err.message || "Unknown server error"
    });
  }
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});