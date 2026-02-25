// ==============================================
// Minimal clean server.js - start fresh
// ==============================================

const express = require('express');
const app = express();
const PORT = 3000;

// This line is VERY important - it lets us read JSON from the request body
app.use(express.json());

// For easier debugging in terminal
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// Simple test route to confirm server works
app.get('/', (req, res) => {
  res.json({ message: 'Server is alive! Use POST to /api/generate-pdf' });
});

// The real endpoint we care about

  }// ────────────────────────────────────────────────
// Real PDF Generation endpoint (simple & working)
// ────────────────────────────────────────────────
const PDFDocument = require('pdfkit');

app.post('/api/generate-pdf', (req, res) => {
  console.log('PDF endpoint called');

  const { name, legal_anchor } = req.body;

  if (!name || !legal_anchor) {
    console.log('Missing fields');
    return res.status(400).json({ error: 'name and legal_anchor are required' });
  }

  // For now: very small list of valid anchors
  // Later replace with: const legalAnchors = require('./legalAnchors.js');
  const validAnchors = ['1999_Const_S36', 'UDHR_Article_19'];

  if (!validAnchors.includes(legal_anchor)) {
    console.log(`Invalid anchor: ${legal_anchor}`);
    return res.status(403).json({ error: 'Invalid legal_anchor' });
  }

  // Everything ok → create PDF
  console.log(`Generating PDF → Name: ${name}, Anchor: ${legal_anchor}`);

  const doc = new PDFDocument({ margin: 50 });
  
  // Tell browser it's a PDF file + suggest filename
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${name}-${legal_anchor}.pdf"`);

  doc.pipe(res);   // send PDF directly to the response

  // Add some content
  doc
    .fontSize(24)
    .text('Legal Document', { align: 'center' })
    .moveDown(1.5);

  doc
    .fontSize(14)
    .text(`Prepared for: ${name}`)
    .text(`Legal Reference: ${legal_anchor}`)
    .moveDown(2);

  doc
    .fontSize(12)
    .text('This document was generated securely.', { align: 'center', continued: true })
    .text('More real content coming from Gemini soon.');

  doc.end();  // finish writing the PDF
});

  // Very simple fake list of valid anchors for now
  const validAnchors = [
    '1999_Const_S36',
    'UDHR_Article_19',
    'other_valid_anchor'
  ];

  if (!validAnchors.includes(legal_anchor)) {
    console.log(`Invalid anchor: ${legal_anchor}`);
    return res.status(403).json({
      error: 'Invalid legal_anchor - not in allowed list'
    });
  }

  // If we reach here → everything looks good
  console.log(`Success! Name: ${name} | Anchor: ${legal_anchor}`);

  res.json({
    success: true,
    message: 'PDF generation would start here (endpoint is working)',
    received: {
      name: name,
      legal_anchor: legal_anchor,
      timestamp: new Date().toISOString()
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Try in PowerShell:');
  console.log(`Invoke-RestMethod -Uri "http://localhost:${PORT}/api/generate-pdf" -Method POST -Body '{"name":"Test","legal_anchor":"1999_Const_S36"}' -ContentType "application/json"`);
});