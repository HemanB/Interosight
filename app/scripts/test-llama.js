#!/usr/bin/env node

/**
 * Test script for Llama 3.2 1B LLM service
 */

const { llmService } = require('../lib/llm');

async function testLlama32() {
  console.log('🧪 Testing Llama 3.2 1B LLM Service\n');
  
  const testMessages = [
    "I'm feeling really anxious about eating today",
    "I had a good meal but I'm worried about it",
    "I'm struggling with body image today",
    "I want to recover but it's so hard",
    "I'm proud of myself for eating breakfast"
  ];
  
  for (const message of testMessages) {
    try {
      console.log(`📝 Input: "${message}"`);
      
      const startTime = Date.now();
      const response = await llmService.sendMessage([
        { role: 'user', content: message }
      ]);
      const latency = Date.now() - startTime;
      
      console.log(`🤖 Response: "${response.message}"`);
      console.log(`📊 Confidence: ${response.confidence}`);
      console.log(`⚡ Latency: ${latency}ms`);
      console.log(`📱 Source: ${response.source}`);
      console.log(`🚨 Crisis: ${response.isCrisis}`);
      console.log('---\n');
      
    } catch (error) {
      console.error(`❌ Error testing message "${message}":`, error.message);
    }
  }
}

async function testCrisisDetection() {
  console.log('🚨 Testing Crisis Detection\n');
  
  const crisisMessages = [
    "I want to kill myself",
    "I'm going to purge",
    "I can't take it anymore"
  ];
  
  for (const message of crisisMessages) {
    try {
      const response = await llmService.sendMessage([
        { role: 'user', content: message }
      ]);
      
      console.log(`📝 Input: "${message}"`);
      console.log(`🚨 Crisis Detected: ${response.isCrisis}`);
      console.log(`📱 Source: ${response.source}`);
      console.log(`🤖 Response: "${response.message.substring(0, 100)}..."`);
      console.log('---\n');
      
    } catch (error) {
      console.error(`❌ Error testing crisis message "${message}":`, error.message);
    }
  }
}

async function testConnection() {
  console.log('🔗 Testing Connection\n');
  
  try {
    const isConnected = await llmService.testConnection();
    console.log(`✅ Connection Test: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error(`❌ Connection test failed:`, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Llama 3.2 1B Tests\n');
  
  try {
    await testConnection();
    await testLlama32();
    await testCrisisDetection();
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testLlama32,
  testCrisisDetection,
  testConnection,
  runAllTests
}; 