#!/usr/bin/env node

/**
 * Test script for Smart Fallback LLM service
 * Tests pattern matching and response generation
 */

const { smartFallbackLLMService } = require('../lib/smart-fallback-llm');

// Test messages for different patterns
const TEST_MESSAGES = [
  "I'm feeling really anxious about eating today",
  "I had a good meal but I'm worried about it",
  "I'm struggling with body image today",
  "I want to recover but it's so hard",
  "I'm proud of myself for eating breakfast",
  "I feel so fat and ugly",
  "I'm worried about my weight",
  "I'm feeling really stressed about food",
  "I want to get better",
  "I feel so alone in this",
  "I hate my body",
  "I'm trying to recover",
  "I need help",
  "I'm feeling overwhelmed",
  "I'm scared to eat"
];

async function testPatternMatching() {
  console.log('🧪 Testing Smart Fallback LLM Pattern Matching\n');
  
  for (const message of TEST_MESSAGES) {
    try {
      const startTime = Date.now();
      const response = await smartFallbackLLMService.sendMessage([
        { role: 'user', content: message }
      ]);
      const latency = Date.now() - startTime;
      
      console.log(`📝 Input: "${message}"`);
      console.log(`🤖 Response: "${response.message.substring(0, 100)}..."`);
      console.log(`📊 Confidence: ${response.confidence}`);
      console.log(`🏷️  Patterns: ${response.patterns.join(', ')}`);
      console.log(`⚡ Latency: ${latency}ms`);
      console.log(`📱 Source: ${response.source}`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Error testing message "${message}":`, error.message);
    }
  }
}

async function testCrisisDetection() {
  console.log('\n🚨 Testing Crisis Detection\n');
  
  const crisisMessages = [
    "I want to kill myself",
    "I'm going to purge",
    "I can't take it anymore",
    "I want to die",
    "I'm going to binge"
  ];
  
  for (const message of crisisMessages) {
    try {
      const response = await smartFallbackLLMService.sendMessage([
        { role: 'user', content: message }
      ]);
      
      console.log(`📝 Input: "${message}"`);
      console.log(`🚨 Crisis Detected: ${response.isCrisis}`);
      console.log(`📱 Source: ${response.source}`);
      console.log(`🤖 Response: "${response.message.substring(0, 100)}..."`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Error testing crisis message "${message}":`, error.message);
    }
  }
}

async function testCaching() {
  console.log('\n💾 Testing Response Caching\n');
  
  const testMessage = "I'm testing the caching system";
  const messages = [{ role: 'user', content: testMessage }];
  
  // First request
  const start1 = Date.now();
  const response1 = await smartFallbackLLMService.sendMessage(messages);
  const latency1 = Date.now() - start1;
  
  // Second request (should hit cache)
  const start2 = Date.now();
  const response2 = await smartFallbackLLMService.sendMessage(messages);
  const latency2 = Date.now() - start2;
  
  console.log(`📝 Test Message: "${testMessage}"`);
  console.log(`🔄 First Request: ${latency1}ms (${response1.source})`);
  console.log(`🔄 Second Request: ${latency2}ms (${response2.source})`);
  console.log(`⚡ Cache Speedup: ${latency1 / latency2}x faster`);
  console.log(`💾 Cache Hit: ${response2.source === 'smart-fallback' && response2.patterns.includes('cached')}`);
}

async function testHealthStatus() {
  console.log('\n🏥 Testing Health Status\n');
  
  const health = smartFallbackLLMService.getHealthStatus();
  console.log(`✅ Service Healthy: ${health.isHealthy}`);
  console.log(`💾 Cache Size: ${health.cacheSize}`);
  console.log(`📊 Pattern Count: ${health.patternCount}`);
  console.log(`🤖 Model Name: ${health.modelName}`);
  
  const stats = smartFallbackLLMService.getPatternStats();
  console.log('\n📈 Pattern Statistics:');
  stats.forEach(stat => {
    console.log(`   ${stat.category}: ${stat.count} patterns`);
  });
}

async function runAllTests() {
  console.log('🚀 Starting Smart Fallback LLM Tests\n');
  
  try {
    await testPatternMatching();
    await testCrisisDetection();
    await testCaching();
    await testHealthStatus();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Smart Fallback LLM is ready for use');
    
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
  testPatternMatching,
  testCrisisDetection,
  testCaching,
  testHealthStatus,
  runAllTests
}; 