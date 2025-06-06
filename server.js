const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route for chat
app.post('/api/chat', async (req, res) => {
  const { message, model } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch response from OpenRouter' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
