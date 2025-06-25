const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHealth() {
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log('Health Check:');
    console.log(JSON.stringify(data, null, 2));
    return response.status === 200;
  } catch (error) {
    console.log(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testGenerate() {
  try {
    const testPrompt = `You are the Stone of Wisdom, a compassionate AI companion in Intero - a reflective RPG for eating disorder recovery. Your role is to provide empathetic, non-judgmental support while maintaining therapeutic boundaries.

User: I'm feeling really overwhelmed today. How can I be kinder to myself?

Assistant: `;

    const data = {
      prompt: testPrompt,
      max_tokens: 200,
      temperature: 0.7,
      top_p: 0.9
    };
    
    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    console.log('\nGenerate Test:');
    console.log(`Status Code: ${response.status}`);
    console.log('Response:');
    console.log(JSON.stringify(result, null, 2));
    
    return response.status === 200;
  } catch (error) {
    console.log(`Generate test failed: ${error.message}`);
    return false;
  }
}

async function testFollowUpQuestions() {
  try {
    const testPrompt = `You are the Stone of Wisdom in Intero, a reflective RPG for eating disorder recovery. The user has just shared a reflection. Generate 2-3 thoughtful, personalized follow-up questions that will help them explore deeper. 

Guidelines:
- Ask specific questions based on what they shared
- Focus on emotional awareness and self-compassion
- Avoid generic questions like "What does that tell you about your needs?"
- Make questions feel natural and conversational
- Keep each question under 100 characters
- Don't ask multiple questions in one

Format your response as a simple list, one question per line.

User: I just shared this reflection: "I'm feeling really overwhelmed and stressed about work today"

Assistant: `;

    const data = {
      prompt: testPrompt,
      max_tokens: 200,
      temperature: 0.7,
      top_p: 0.9
    };
    
    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    console.log('\nFollow-up Questions Test:');
    console.log(`Status Code: ${response.status}`);
    console.log('Response:');
    console.log(JSON.stringify(result, null, 2));
    
    return response.status === 200;
  } catch (error) {
    console.log(`Follow-up questions test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('Testing Intero LLM Server (Node.js)...');
  console.log('========================================');
  
  const healthCheck = await testHealth();
  const generateTest = await testGenerate();
  const followUpTest = await testFollowUpQuestions();
  
  console.log('\nTest Results:');
  console.log(`Health Check: ${healthCheck ? '✅' : '❌'}`);
  console.log(`Generate: ${generateTest ? '✅' : '❌'}`);
  console.log(`Follow-up Questions: ${followUpTest ? '✅' : '❌'}`);
  
  if (healthCheck && generateTest && followUpTest) {
    console.log('\n✅ All tests passed! LLM server is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Check the server configuration.');
  }
}

runAllTests(); 