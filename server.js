const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');
const { validateEmail, validatePassword } = require('./validation');
require('dotenv').config();const { encrypt, decrypt } = require('./encryption');

const { executeRule } = require('./jsonlogic');
const { createPDF } = require('./pdfGenerator');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// JSON Logic endpoint
app.post('/api/check-rule', (req, res) => {
  const result = executeRule(req.body.rule, req.body.data);
  res.json({ result: result });
});

// PDF Generation endpoint
app.post('/api/generate-pdf', async (req, res) => {
  const pdfData = {
    name: req.body.name,
    date: new Date().toLocaleDateString()
  };
  
  const pdf = await createPDF(pdfData);
  res.contentType('application/pdf');
  res.send(pdf);
});

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const [result] = await db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    res.status(201).json({
      message: 'User created successfully!',
      userId: result.insertId,
      email: email
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});// Create legal document
app.post('/legal-documents', async (req, res) => {
  try {
    const {
      user_id,
      user_legal_name,
      target_entity_name,
      incident_timestamp,
      notice_period_days,
      court_order_status
    } = req.body;

    // Validate required fields
    if (!user_id || !user_legal_name || !target_entity_name || !incident_timestamp || !notice_period_days) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Encrypt sensitive data
    const encryptedName = encrypt(user_legal_name);

    // Insert legal document into database
    const [result] = await db.query(
      `INSERT INTO legal_documents 
       (user_id, user_legal_name, target_entity_name, incident_timestamp, notice_period_days, court_order_status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, encryptedName, target_entity_name, incident_timestamp, notice_period_days, court_order_status || false]
    );

    res.status(201).json({
      message: 'Legal document created successfully!',
      documentId: result.insertId
    });

  } catch (error) {
    console.error('Create legal document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all legal documents for a user
app.get('/legal-documents/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const [documents] = await db.query(
      'SELECT * FROM legal_documents WHERE user_id = ?',
      [user_id]
    );

    // Decrypt sensitive data before sending
    const decryptedDocuments = documents.map(doc => ({
      ...doc,
      user_legal_name: decrypt(doc.user_legal_name)
    }));

    res.json({ documents: decryptedDocuments });

  } catch (error) {
    console.error('Get legal documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});