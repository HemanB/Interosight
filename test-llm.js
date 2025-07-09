#!/usr/bin/env node

// Simple test script for LLM integration
// Run with: node test-llm.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOllamaConnection() {
  console.log('🧪 Testing Ollama Connection...');
  
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama is running!');
      console.log('📋 Available models:', data.models?.map(m => m.name).join(', ') || 'None');
      return true;
    } else {
      console.log('❌ Ollama is not responding properly');
      return false;
    }
  } catch (error) {
    console.log('❌ Ollama is not running or not accessible');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testOllamaModel(model = 'lukashabtoch/plutotext-r2-emotional') {
  console.log(`\n🤖 Testing ${model} model...`);
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: 'Hello, I am testing the model for InteroSight. Please respond with a brief, supportive message.',
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 100,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Model test successful!');
      console.log('📝 Response:', data.response);
      return true;
    } else {
      console.log('❌ Model test failed');
      const error = await response.text();
      console.log('   Error:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Model test failed');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testFollowUpPrompts() {
  console.log(`\n🤖 Testing follow-up prompt generation...`);
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'lukashabtoch/plutotext-r2-emotional',
        prompt: `USER INPUT: "I'm feeling really anxious about my eating habits today"

SYSTEM_PROMPT: You are the Stone of Wisdom, a compassionate AI companion for eating disorder recovery interactive journaling.

TASK: Generate exactly 3 follow-up questions based on the user's input above.

CRITICAL INSTRUCTIONS:
- DO NOT continue the conversation
- DO NOT generate user messages
- DO NOT add any explanatory text
- ONLY output 3 questions, one per line
- Each line must end with a question mark
- NO preambles, NO explanations, NO extra text

REQUIRED OUTPUT FORMAT:
Question 1?
Question 2?
Question 3?

STOP after the third question. Do not continue.`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 300,
          stop: ['\n\n', 'User:', 'STONE:', 'USER:', '| im_end|', '| im_start|'],
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Follow-up prompt test successful!');
      console.log('📝 Response:', data.response);
      return true;
    } else {
      console.log('❌ Follow-up prompt test failed');
      const error = await response.text();
      console.log('   Error:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Follow-up prompt test failed');
    console.log('   Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 InteroSight LLM Integration Test');
  console.log('=====================================\n');

  // Test Ollama connection
  const ollamaRunning = await testOllamaConnection();
  
  if (ollamaRunning) {
    // Test the emotional model
    await testOllamaModel('lukashabtoch/plutotext-r2-emotional');
    
    // Test follow-up prompt generation
    await testFollowUpPrompts();
  }

  console.log('\n📝 Next Steps:');
  console.log('   1. If Ollama is working, start your InteroSight app');
  console.log('   2. The chat will automatically use the available model');
  console.log('   3. If no model is available, it will fall back to mock responses');
  console.log('\n🔧 Commands:');
  console.log('   - Start Ollama: ollama serve');
  console.log('   - Pull a model: ollama pull lukashabtoch/plutotext-r2-emotional');
  console.log('   - List models: ollama list');
}

main().catch(console.error); 