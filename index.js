// index.js
// Clean backend version with explicit valid anchors list

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ────────────────────────────────────────────────
// Valid legal anchors – expand this list as needed
// ────────────────────────────────────────────────
const VALID_LEGAL_ANCHORS = [
  // Nigeria – Constitution
  "Nigerian Constitution Section 35",
  "Nigerian Constitution Section 36",
  "Nigerian Constitution Section 33",
  "Nigerian Constitution Section 34",
  "Nigerian Constitution Section 41",
  "Nigerian Constitution Section 1999 Section 35",   // common full reference style

  // Nigeria – Penal Code / Criminal Law
  "Nigerian Penal Code Section 200",
  "Nigerian Penal Code Section 221",
  "Nigerian Penal Code Section 316",
  "Criminal Code Act Section 319",

  // Nigeria – Evidence & Procedure
  "Evidence Act Section 84",
  "Evidence Act Section 83",
  "Administration of Criminal Justice Act Section 396",

  // Fiji
  "Fiji Constitution Section 14",
  "Fiji Constitution Section 22",
  "Crimes Decree 2009 Section 45",
  "Crimes Decree 2009 Section 97",
  "Crimes Decree 2009 Section 210",

  // Add more anchors here when you get real requirements
];

// Health / root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Legal backend is alive",
    usage: "POST /api/generate-pdf with { name: string, legal_anchor: string }"
  });
});

// Main legal endpoint
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { name, legal_anchor } = req.body;

    // ───── Input validation ─────
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        error: "Invalid or missing 'name'. Must be a non-empty string (min 2 characters)."
      });
    }

    if (!legal_anchor || typeof legal_anchor !== 'string' || legal_anchor.trim() === '') {
      return res.status(400).json({
        error: "Missing or invalid 'legal_anchor'. Must be a non-empty string."
      });
    }

    const cleanAnchor = legal_anchor.trim();

    // Case-insensitive partial match to make it more forgiving
    const isValid = VALID_LEGAL_ANCHORS.some(anchor =>
      anchor.toLowerCase().includes(cleanAnchor.toLowerCase()) ||
      cleanAnchor.toLowerCase().includes(anchor.toLowerCase())
    );

    if (!isValid) {
      return res.status(400).json({
        error: "Invalid legal_anchor value.",
        message: "Please use one of the supported anchors (partial match allowed)",
        valid_anchors: VALID_LEGAL_ANCHORS
      });
    }

    // ───── Gemini / AI logic placeholder ─────
    // Replace this block with real Gemini integration when ready

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({
        error: "Server configuration error – missing Gemini API key"
      });
    }

    // Simulated response – replace with actual API call
    const result = {
      person: name.trim(),
      anchor: cleanAnchor,
      analysis: `Analysis for ${name} under ${cleanAnchor} (placeholder response)`,
      recommendation: "The facts appear to engage the fundamental right / offence described in the cited provision.",
      confidence: "medium",
      pdf_download_link: "https://example.com/placeholder-legal-advice.pdf"
    };

    // ───── Success response ─────
    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error("Error in /api/generate-pdf:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.path}`
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`URL: https://mindstormerx-backend.onrender.com`);
});