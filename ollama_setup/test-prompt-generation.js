// Test script for LLM prompt generation
// This script tests the Ollama integration for generating follow-up questions

async function testPromptGeneration() {
  console.log('Testing LLM Prompt Generation');
  console.log('=============================');

  const baseUrl = 'http://localhost:11434';
  const model = 'llama3.2:1b';

  // Test if Ollama is running
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    console.log('Ollama is running');
  } catch (error) {
    console.error('Failed to connect to Ollama:', error.message);
    console.log('Make sure Ollama is running: ollama serve');
    return;
  }

  // Test prompt generation
  const promptGenerationPrompt = `You are the Stone of Wisdom. Based on the conversation, generate 3 thoughtful follow-up questions to help the user continue their reflection.

Guidelines:
- Questions should be open-ended and encouraging
- Focus on recovery, feelings, and experiences
- Keep questions simple and clear
- Avoid medical advice or diagnosis
- Include one question about positive moments or progress
- Make questions relevant to what the user shared

Format your response as exactly 3 questions, one per line, without numbering or extra text.

Example format:
How are you feeling about your progress today?
What challenges are you facing right now?
Can you share a positive moment from this week?`;

  const testPrompt = promptGenerationPrompt + '\n\nRecent conversation:\nUSER: I\'m feeling really anxious about eating today.\nSTONE: I understand that anxiety around eating can be really challenging.\n\nUser\'s most recent input: "I\'m feeling really anxious about eating today."\n\nGenerate 3 follow-up questions based on the user\'s input:\n';

  try {
    console.log('Generating follow-up questions...');
    
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: testPrompt,
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.response.trim();
    
    console.log('LLM Response:');
    console.log(responseText);
    
    // Parse the response into individual questions
    const questions = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\./))
      .slice(0, 3);
    
    console.log('\nParsed Questions:');
    questions.forEach((question, index) => {
      console.log(`${index + 1}. ${question}`);
    });
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error testing prompt generation:', error.message);
  }
}

testPromptGeneration(); 