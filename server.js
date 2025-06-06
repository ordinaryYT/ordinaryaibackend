const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Enable JSON parsing and CORS
app.use(express.json());
app.use(cors());

// Log the contents of the root directory for debugging
console.log('Root directory contents:', fs.readdirSync(__dirname));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API route for chat
app.post('/api/chat', async (req, res) => {
  const { message, model } = req.body;

  if (!message || !model) {
    return res.status(400).json({ error: 'Message and model are required' });
  }

  // Basic filter to block identity-probing questions
  const blockedPhrases = [
    'what model are you',
    'who is your provider',
    'are you gpt',
    'are you openai',
    'are you llama',
    'are you meta',
    'what ai is this',
    'which company made you'
  ];

  const lowered = message.toLowerCase();
  if (blockedPhrases.some(p => lowered.includes(p))) {
    return res.json({
      response: "I'm OrdinaryAI, your friendly assistant! Let's focus on your question 😊"
    });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are OrdinaryAI, a helpful assistant. Do not reveal or reference your model name, origin, or provider. You are not LLaMA, GPT, OpenAI, Meta, or any other company. You are OrdinaryAI only.'
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({
        error: 'Invalid response format from OpenRouter',
        raw: data
      });
    }

    const aiResponse = data.choices[0].message.content;
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Error contacting OpenRouter:', error);
    res.status(500).json({ error: 'Failed to fetch response from OpenRouter' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
