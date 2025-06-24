#!/usr/bin/env node

/**
 * Local LLM Server for InteroSight
 * Hosts Llama 3.2 1B locally using Ollama
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'exp://localhost:8081'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 60, // 60 requests
  duration: 60, // per minute
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => {
      res.status(429).json({
        error: 'Rate limit exceeded. Please try again in a minute.',
        retryAfter: 60
      });
    });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    model: 'llama3.2:1b'
  });
});

// Main LLM endpoint
app.post('/api/chat', rateLimiterMiddleware, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { messages, model = 'llama3.2:1b' } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages array is required'
      });
    }

    // Build prompt from messages
    const prompt = buildPrompt(messages);
    
    // Call Ollama API
    const response = await callOllama(prompt, model);
    
    const latency = Date.now() - startTime;
    
    res.json({
      message: response,
      isCrisis: false,
      confidence: 0.8,
      source: 'local',
      latency,
      model
    });

  } catch (error) {
    console.error('LLM Server Error:', error);
    
    const latency = Date.now() - startTime;
    
    res.status(500).json({
      message: getFallbackResponse(),
      isCrisis: false,
      confidence: 0.5,
      source: 'fallback',
      latency,
      error: error.message
    });
  }
});

// Build prompt for Llama 3.1
function buildPrompt(messages) {
  const systemPrompt = `You are InteroSight, a compassionate AI companion designed to support individuals in eating disorder recovery. Your role is to provide empathetic, non-judgmental support while maintaining therapeutic boundaries.

Key Guidelines:
- Always respond with warmth, empathy, and understanding
- Never give medical advice or replace professional treatment
- Focus on emotional support and gentle encouragement
- Use inclusive, body-positive language
- Avoid triggering content about calories, weight, or specific eating behaviors
- Encourage self-compassion and self-care
- Recognize crisis situations and provide appropriate resources
- Maintain a supportive, non-coercive approach

Your responses should be:
- Warm and conversational
- Focused on emotional well-being
- Encouraging of professional support when needed
- Mindful of recovery language and triggers
- Supportive of individual recovery journeys

Remember: You are here to listen, support, and encourage, not to diagnose or treat.`;

  // Format conversation for Llama 3.1
  let prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|>`;
  
  for (const message of messages) {
    const role = message.role === 'user' ? 'user' : 'assistant';
    prompt += `<|start_header_id|>${role}<|end_header_id|>\n${message.content}<|eot_id|>`;
  }
  
  prompt += `<|start_header_id|>assistant<|end_header_id|>\n`;
  
  return prompt;
}

// Call Ollama API
async function callOllama(prompt, model = 'llama3.2:1b') {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  return data.response || 'I understand. How can I support you right now?';
}

// Fallback responses
function getFallbackResponse() {
  const responses = [
    "I'm having trouble connecting right now, but I'm still here for you. How are you feeling?",
    "I want to make sure I'm giving you my full attention. Could you tell me more about what's on your mind?",
    "I hear you, and I'm here to listen. What would be most helpful for you right now?",
    "Thank you for sharing that with me. How can I best support you in this moment?",
    "I'm here to listen and support you. What's coming up for you right now?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong. Please try again.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`InteroSight Local LLM Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`Make sure Ollama is running: ollama serve`);
});

module.exports = app; 