const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'Server is running. Use POST /api/generate' });
});

app.post('/api/generate', async (req, res) => {
    console.log('Received request body:', req.body);

    const { incident, country } = req.body;

    if (!incident || !country) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'Please provide both "incident" and "country"'
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

        const prompt = `You are a legal advisor. A user from ${country} has reported this incident: "${incident}". 
        Provide a clear legal response based on the laws of ${country}. 
        If the country is Nigeria, reference the 1999 Constitution of Nigeria and the Administration of Criminal Justice Act.
        If the country is Fiji, reference Universal Declaration of Human Rights and Fijian legal framework.
        Keep the response clear and helpful for a non-lawyer.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.status(200).json({
            success: true,
            data: {
                country: country,
                incident: incident,
                legalResponse: text,
                anchors: country === 'Nigeria'
                    ? ['1999 Constitution of Nigeria', 'Administration of Criminal Justice Act']
                    : ['Universal Declaration of Human Rights', `${country} Legal Framework`]
            }
        });

    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            message: error.message
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});