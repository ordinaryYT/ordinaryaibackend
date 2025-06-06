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

// Default route to serve index.html from root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API route for chat
app.post('/api/chat', async (req, res) => {
  const { message, model } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY', // Replace this
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No response';
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch response from OpenRouter' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
