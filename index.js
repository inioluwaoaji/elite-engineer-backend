const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test endpoint to verify server is running
app.get('/', (req, res) => {
    res.json({ message: 'Server is running. Use POST /api/generate' });
});

// POST endpoint for /api/generate
app.post('/api/generate', (req, res) => {
    // Log the received request body for debugging
    console.log('Received request body:', req.body);
    
    // Extract incident and country from the request body
    const { incident, country } = req.body;
    
    // Validate that required fields are present
    if (!incident || !country) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            message: 'Please provide both "incident" and "country" in the request body'
        });
    }
    
    // Simple test response (will be replaced with Gemini API later)
    const testResponse = {
        success: true,
        data: {
            country: country,
            incident: incident,
            legalResponse: `[TEST RESPONSE] Legal analysis for ${country} regarding: "${incident}"\n\nThis is a placeholder response. Gemini API integration will be added here.`,
            anchors: country === 'Nigeria' 
                ? ['1999 Constitution of Nigeria', 'Administration of Criminal Justice Act'] 
                : ['Universal Declaration of Human Rights', `${country} Legal Framework`]
        }
    };
    
    // Send the response back to the client
    res.status(200).json(testResponse);
});

// Handle 404 for undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test POST endpoint at: http://localhost:${PORT}/api/generate`);
});