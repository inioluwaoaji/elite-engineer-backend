require('dotenv').config();
const express = require('express');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Root route – quick test that server is alive
app.get('/', (req, res) => {
  res.json({
    message: "Server is alive! Use POST /api/generate-pdf with {name, legal_anchor}"
  });
});

// Main PDF endpoint – TEMPORARY VERSION (Gemini bypassed)
app.post('/api/generate-pdf', (req, res) => {
  const { name = "User", legal_anchor } = req.body;

  // List of valid anchors (add Fiji or others here when ready)
  const validAnchors = [
    "1999_Const_S36",       // Nigeria example
    "1997_Const_Art14",     // Fiji example (add real ones later)
    "ICCPR_Art19",
    "ACHPR_Art9",
    "UDHR_Art19",
    "ICESCR_Art13",
    "ILO_Conv98",
    "CRC_Art13",
    "CEDAW_Art10",
    "CAT_Art14",
    "CRPD_Art21"
  ];

  if (!legal_anchor || !validAnchors.includes(legal_anchor)) {
    return res.status(400).json({
      error: "Invalid or missing legal_anchor. Use one from the valid list."
    });
  }

  try {
    // Fake/test content (replace with Gemini when fixed)
    const fakeContent = `
This is a TEST legal document generated for ${name}.
Legal reference: ${legal_anchor}
(Gemini API currently bypassed due to access issue – real content coming soon)
    `;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set PDF headers BEFORE piping
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${name}-${legal_anchor}.pdf"`
    );

    doc.pipe(res);

    // PDF content
    doc.fontSize(24).text('Legal Document (Test Mode)', { align: 'center' }).moveDown(1);
    doc.fontSize(14).text(`Prepared for: ${name}`).text(`Reference: ${legal_anchor}`).moveDown(2);
    doc.fontSize(12).text(fakeContent, { align: 'justify' });

    doc.end();

  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});