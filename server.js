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

// Serve static files from the root directory (includes index.html, CSS, etc.)
app.use(express.static(__dirname));

// Serve index.html at root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Chat API route
app.post('/api/chat', async (req, res) => {
  const { message, model } = req.body;

  if (!message || !model) {
    return res.status(400).json({ error: 'Message and model are required' });
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
        messages: [{ role: 'user', content: message }]
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
