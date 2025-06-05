require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());

// Map display names to OpenRouter model IDs
const modelMapping = {
  'OrdinaryAI1': 'openai/gpt-4',
  'OrdinaryAI2': 'anthropic/claude-3-opus',
  'OrdinaryAI3': 'meta-llama/llama-3.1-70b',
  'OrdinaryAI4': 'google/gemini-pro',
  'OrdinaryAI5': 'mistral/mixtral-8x7b'
};

// Smartest model logic
const modelScores = {
  'OrdinaryAI1': { name: 'OrdinaryAI1', score: 128000, description: 'Great for complex tasks' },
  'OrdinaryAI2': { name: 'OrdinaryAI2', score: 200000, description: 'Best for reasoning' },
  'OrdinaryAI3': { name: 'OrdinaryAI3', score: 70000, description: 'Balanced performance' },
  'OrdinaryAI4': { name: 'OrdinaryAI4', score: 80000, description: 'Fast and efficient' },
  'OrdinaryAI5': { name: 'OrdinaryAI5', score: 32000, description: 'Lightweight and quick' }
};

app.get('/api/models', (req, res) => {
  res.json(modelScores);
});

app.post('/api/chat', async (req, res) => {
  const { message, model } = req.body;
  const actualModel = modelMapping[model] || modelMapping['OrdinaryAI1'];

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: actualModel,
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
