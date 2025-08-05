import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the model
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;

// Debug environment variables (remove in production)
console.log('Environment Variables:', {
  VITE_GOOGLE_AI_API_KEY: API_KEY ? 'Present' : 'Missing',
  envKeys: Object.keys(import.meta.env)
});

if (!API_KEY) {
  throw new Error(
    'Google AI API key not found. Please add VITE_GOOGLE_AI_API_KEY to your .env file in the app directory. ' +
    'Available env keys: ' + Object.keys(import.meta.env).join(', ')
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Configure the model
const modelConfig = {
  model: "gemma-3-12b-it", // Using Gemma 12B instruction-tuned model
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 200,
  }
};

console.log('Initializing model with config:', modelConfig);
const model = genAI.getGenerativeModel(modelConfig);

interface GeneratePromptParams {
  userResponse: string;
  originalPrompt: string;
  previousPrompts?: Array<{ content: string; type: 'ai_prompt' | 'module_journal' }>;
}

export const generateFollowUpPrompt = async ({
  userResponse,
  originalPrompt,
  previousPrompts = []
}: GeneratePromptParams): Promise<string> => {
  try {
    console.log('Generating follow-up prompt with:', {
      responseLength: userResponse.length,
      originalPromptLength: originalPrompt.length,
      previousPromptsCount: previousPrompts.length,
      modelConfig
    });

    // Build the conversation history
    const conversationHistory = previousPrompts
      .map((p, index) => {
        if (p.type === 'module_journal') {
          return `User: ${p.content}`;
        } else {
          return `Assistant: ${p.content}`;
        }
      })
      .join('\n');

    const prompt = `You are a therapeutic journaling assistant. Your goal is to help users explore their thoughts and feelings more deeply.

Initial prompt: "${originalPrompt}"

Conversation history:
${conversationHistory}
User: ${userResponse}

Based on the complete conversation history above, generate a follow-up question that:
1. Builds on the user's ENTIRE response chain, not just their last response
2. Shows understanding of the conversation's progression
3. Encourages deeper reflection
4. Is empathetic and supportive
5. Avoids being too directive or prescriptive
6. Uses open-ended phrasing
7. Is 1-2 sentences long
8. Does not repeat previous questions or themes unless deliberately building upon them

Response format: Just the follow-up question, no additional text.`;

    // Log the full prompt being sent to the model
    console.log('Full prompt being sent to LLM:', {
      prompt,
      modelConfig,
      timestamp: new Date().toISOString(),
      conversationLength: previousPrompts.length + 1 // +1 for current response
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Log the full response from the model
    console.log('Full response from LLM:', {
      response: text,
      modelConfig,
      timestamp: new Date().toISOString()
    });
    
    return text;
  } catch (error) {
    console.error('Error generating follow-up prompt:', error);
    throw new Error('Failed to generate follow-up question. Please try again.');
  }
}; 