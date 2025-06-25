const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    model: 'llama3.2:1b',
    timestamp: new Date().toISOString()
  });
});

// Single generate endpoint - clean and simple
app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Call Ollama
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt,
        stream: false
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama error: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    
    res.json({
      response: data.response,
      model: 'llama3.2:1b',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generate error:', error.message);
    res.status(500).json({ 
      error: 'Generation failed', 
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Intero LLM Server running on port ${PORT}`);
  console.log(`🤖 Connected to Ollama (llama3.2:1b)`);
}); 