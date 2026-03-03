// server.js - Final simplified version (no strict validation, real Gemini)
// Deploy-ready for Render - March 2026

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware
app.use(cors()); // Allow calls from Thunkable/mobile
app.use(express.json());

// Root health check (what you see in browser)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Legal backend live',
    endpoint: 'POST /api/generate-pdf',
    example_body: {
      name: "Aisha Mohammed",
      legal_anchor: "Nigerian Constitution Section 35"
    },
    note: 'Any reasonable legal_anchor accepted - Gemini will handle analysis'
  });
});

// Example anchors (for your reference - not enforced)
const EXAMPLE_ANCHORS = [
  "Nigerian Constitution Section 35",     // Personal liberty
  "Nigerian Constitution Section 36",     // Fair hearing
  "Nigerian Penal Code Section 200",
  "Evidence Act Section 84",
  "Fiji Constitution Section 14",
  "Crimes Decree 2009 Section 45"
  // Add more later if needed
];

// Main endpoint - no validation on anchor value
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { name, legal_anchor } = req.body;

    // Minimal checks only
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: "Missing or invalid 'name'" });
    }
    if (!legal_anchor || typeof legal_anchor !== 'string' || legal_anchor.trim() === '') {
      return res.status(400).json({ error: "Missing or invalid 'legal_anchor'" });
    }

    const cleanName = name.trim();
    const cleanAnchor = legal_anchor.trim();

    // Gemini setup
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set");
      return res.status(500).json({ error: "Server missing Gemini API key" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt for legal analysis
    const prompt = `
You are a legal expert in Nigerian and Fijian law.
Analyze the following:

Person/Case: ${cleanName}
Legal provision/anchor: ${cleanAnchor}

Provide:
1. Summary of what the provision says
2. How it typically applies
3. Potential implications/outcomes
4. Short recommendation

Keep professional, concise (<400 words). No disclaimers needed.
`;

    const result = await model.generateContent(prompt);
    const geminiResponse = result.response.text();

    // Return
    return res.status(200).json({
      success: true,
      name: cleanName,
      legal_anchor: cleanAnchor,
      analysis: geminiResponse,
      generated_at: new Date().toISOString()
    });

  } catch (err) {
    console.error("Error in generate-pdf:", err.message);
    return res.status(500).json({
      error: "Failed to process request",
      details: err.message.includes('API') ? "Gemini API issue" : "Server error"
    });
  }
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});