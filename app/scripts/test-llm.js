#!/usr/bin/env node

/**
 * Test script for InteroSight LLM integration
 * Tests rate limiting, queue management, and error handling
 */

const { llmService } = require('../lib/llm');

// Test configuration
const TEST_CONFIG = {
  concurrentRequests: 10,
  totalRequests: 50,
  delayBetweenBatches: 1000, // 1 second
};

// Test messages
const TEST_MESSAGES = [
  "I'm feeling really anxious about eating today",
  "I had a good meal but I'm worried about it",
  "I'm struggling with body image today",
  "I want to recover but it's so hard",
  "I'm proud of myself for eating breakfast",
];

async function testSingleRequest() {
  console.log('🧪 Testing single request...');
  
  try {
    const startTime = Date.now();
    const response = await llmService.sendMessage([
      { role: 'user', content: TEST_MESSAGES[0] }
    ]);
    const latency = Date.now() - startTime;
    
    console.log(`✅ Single request successful:`);
    console.log(`   - Response: ${response.message.substring(0, 100)}...`);
    console.log(`   - Source: ${response.source}`);
    console.log(`   - Latency: ${latency}ms`);
    console.log(`   - Confidence: ${response.confidence}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Single request failed: ${error.message}`);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n🧪 Testing rate limiting...');
  
  const promises = [];
  const startTime = Date.now();
  
  // Send multiple requests quickly
  for (let i = 0; i < TEST_CONFIG.concurrentRequests; i++) {
    const message = TEST_MESSAGES[i % TEST_MESSAGES.length];
    promises.push(
      llmService.sendMessage([
        { role: 'user', content: message }
      ]).catch(error => ({ error: error.message }))
    );
  }
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  
  console.log(`✅ Rate limiting test completed:`);
  console.log(`   - Successful: ${successful}`);
  console.log(`   - Failed: ${failed}`);
  console.log(`   - Total time: ${totalTime}ms`);
  console.log(`   - Average time per request: ${totalTime / TEST_CONFIG.concurrentRequests}ms`);
  
  return successful > 0;
}

async function testQueueManagement() {
  console.log('\n🧪 Testing queue management...');
  
  const health = llmService.getHealthStatus();
  console.log(`   - Current queue length: ${health.queueLength}`);
  console.log(`   - Service health: ${health.isHealthy ? 'Healthy' : 'Unhealthy'}`);
  console.log(`   - Error count: ${health.errorCount}`);
  console.log(`   - Cache size: ${health.cacheSize}`);
  
  return health.isHealthy;
}

async function testCaching() {
  console.log('\n🧪 Testing response caching...');
  
  const message = "I'm testing the caching system";
  const messages = [{ role: 'user', content: message }];
  
  // First request (should hit API)
  const start1 = Date.now();
  const response1 = await llmService.sendMessage(messages);
  const latency1 = Date.now() - start1;
  
  // Second request (should hit cache)
  const start2 = Date.now();
  const response2 = await llmService.sendMessage(messages);
  const latency2 = Date.now() - start2;
  
  console.log(`✅ Caching test completed:`);
  console.log(`   - First request: ${latency1}ms (${response1.source})`);
  console.log(`   - Second request: ${latency2}ms (${response2.source})`);
  console.log(`   - Cache speedup: ${latency1 / latency2}x faster`);
  
  return response2.source === 'cached';
}

async function testErrorHandling() {
  console.log('\n🧪 Testing error handling...');
  
  // Test with invalid API key (temporarily)
  const originalConfig = llmService.config;
  llmService.config.apiKey = 'invalid_key';
  
  try {
    const response = await llmService.sendMessage([
      { role: 'user', content: 'This should fail' }
    ]);
    
    console.log(`✅ Error handling test completed:`);
    console.log(`   - Fallback response: ${response.source === 'fallback'}`);
    console.log(`   - Response: ${response.message.substring(0, 100)}...`);
    
    return response.source === 'fallback';
  } finally {
    // Restore original config
    llmService.config = originalConfig;
  }
}

async function runAllTests() {
  console.log('🚀 Starting InteroSight LLM Integration Tests\n');
  
  const tests = [
    { name: 'Single Request', fn: testSingleRequest },
    { name: 'Rate Limiting', fn: testRateLimiting },
    { name: 'Queue Management', fn: testQueueManagement },
    { name: 'Caching', fn: testCaching },
    { name: 'Error Handling', fn: testErrorHandling },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ ${test.name} test failed with exception: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${result.name}: ${status}`);
  });
  
  console.log(`\nOverall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! LLM integration is ready for production.');
    return 0;
  } else {
    console.log('❌ Some tests failed. Please check the configuration and try again.');
    return 1;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testSingleRequest,
  testRateLimiting,
  testQueueManagement,
  testCaching,
  testErrorHandling,
  runAllTests
}; 