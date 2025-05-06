const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages array.' });
  }

  try {
    // Call Ollama API - using the correct endpoint
    const ollamaRes = await axios.post('http://localhost:11434/api/chat', {
      model: 'qwen2.5:1.5b',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      stream: false
    });

    // Extract the AI's response
    const aiMessage = {
      role: 'assistant',
      content: ollamaRes.data.message?.content || ollamaRes.data.response
    };
    
    res.json({ message: aiMessage });
  } catch (err) {
    console.error('Ollama API error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: 'Cannot connect to Ollama. Please make sure Ollama is running on http://localhost:11434',
        details: err.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to connect to Ollama API.',
        details: err.message 
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
}); 