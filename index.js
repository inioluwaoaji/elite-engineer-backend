// index.js - LegalTech Backend for Render
// Minimal, production-ready version

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // only needed if you also use .env locally

const app = express();

// Middleware
app.use(cors());                    // allow Thunkable / frontend calls
app.use(express.json({ limit: '10mb' })); // support reasonable JSON payloads

// Health check / root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Server is alive! Use POST /api/generate-pdf with {name, legal_anchor}"
  });
});

// Valid legal anchors (expand this list as needed)
const VALID_LEGAL_ANCHORS = [
  "Nigerian Constitution Section 35",
  "Nigerian Constitution Section 36",
  "Nigerian Penal Code Section 200",
  "Evidence Act Section 84",
  "Fiji Crimes Decree 2009 Section 45",
  "Fiji Constitution Section 14",
  // Add more real anchors here...
];

// POST endpoint for legal analysis / PDF generation
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { name, legal_anchor } = req.body;

    // Basic input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        error: "Invalid or missing 'name'. Must be a non-empty string."
      });
    }

    if (!legal_anchor || typeof legal_anchor !== 'string') {
      return res.status(400).json({
        error: "Missing or invalid 'legal_anchor'. Must be a string."
      });
    }

    // Check against allowed anchors (case-insensitive match for flexibility)
    const normalizedAnchor = legal_anchor.trim().toLowerCase();
    const isValidAnchor = VALID_LEGAL_ANCHORS.some(anchor =>
      anchor.toLowerCase().includes(normalizedAnchor) ||
      normalizedAnchor.includes(anchor.toLowerCase())
    );

    if (!isValidAnchor) {
      return res.status(400).json({
        error: "Invalid legal_anchor. Use one similar to: " +
               VALID_LEGAL_ANCHORS.slice(0, 3).join(", ") + " ...",
        validExamples: VALID_LEGAL_ANCHORS
      });
    }

    // ────────────────────────────────────────────────
    // Gemini API call (replace with your real logic)
    // ────────────────────────────────────────────────
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY missing in environment variables");
      return res.status(500).json({
        error: "Server configuration error - API key not set"
      });
    }

    // Placeholder for actual Gemini call
    // You can use @google/generative-ai or fetch directly
    const geminiResponse = {
      // Simulate successful response
      analysis: `Legal analysis for ${name} based on ${legal_anchor}`,
      recommendation: "The provision applies because...",
      pdfUrl: "https://example.com/generated/legal-advice.pdf" // or generate real PDF
    };

    // ────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      data: geminiResponse
    });

  } catch (error) {
    console.error("Error in /api/generate-pdf:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - https://mindstormerx-backend.onrender.com`);
});