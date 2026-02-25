require('dotenv').config();
const express = require('express');
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log('Gemini model ready – API key is loaded');

// Approved legal anchors (your list from Ade)
const validAnchors = [
  "1999_Const_S36", "ICCPR_Art19", "ACHPR_Art9", "UDHR_Art19",
  "ICESCR_Art13", "ILO_Conv98", "CRC_Art13", "CEDAW_Art10",
  "CAT_Art14", "CRPD_Art21"
];

// Root test route
app.get('/', (req, res) => {
  res.json({ message: "Server alive! POST to /api/generate-pdf" });
});

// Main PDF generation endpoint
app.post('/api/generate-pdf', async (req, res) => {
  const { name = "User", legal_anchor } = req.body;

  // 1. Verify legal anchor
  if (!legal_anchor || !validAnchors.includes(legal_anchor)) {
    return res.status(400).json({ error: "Invalid or missing legal_anchor" });
  }

  try {
    // 2. Generate content with Gemini
    const prompt = `
      You are a legal expert. Generate a formal, structured legal document (400-800 words) for the user "${name}".
      The document must strictly reference the legal anchor: "${legal_anchor}".
      Use accurate, formal language. Structure:
      - Introduction
      - Key Provisions
      - Implications for the user
      - Conclusion
      Do not add unrelated laws or make up facts.
    `;

    const result = await model.generateContent(prompt);
    const aiContent = result.response.text();

    // 3. Create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${name || 'Document'}-${legal_anchor}.pdf"`);

    doc.pipe(res);

    // PDF content
    doc.fontSize(24).text('Legal Document', { align: 'center' }).moveDown(1);
    doc.fontSize(14).text(`Prepared for: ${name || 'User'}`).text(`Reference: ${legal_anchor}`).moveDown(2);

    doc.fontSize(12).text(aiContent, { align: 'justify' });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});