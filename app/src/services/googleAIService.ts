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

    const prompt = `You are a therapeutic journaling assistant for eating disorder recovery. Your goal is to help users explore their thoughts and feelings more deeply.

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

interface GenerateSummaryParams {
  content: string;
  entryType: 'freeform' | 'module' | 'meal' | 'behavior';
  metadata?: {
    mealType?: string;
    location?: string;
    socialContext?: string;
    satietyPre?: number;
    satietyPost?: number;
    emotionPre?: string[];
    emotionPost?: string[];
    affectPre?: number;
    affectPost?: number;
  };
}

export const generateEntrySummary = async ({
  content,
  entryType,
  metadata = {}
}: GenerateSummaryParams): Promise<string> => {
  try {
    console.log('Generating summary for entry type:', entryType);

    let systemPrompt = '';
    let userPrompt = '';

    switch (entryType) {
      case 'freeform':
      case 'module':
        systemPrompt = `You are a clinical assistant analyzing journal entries for eating disorder recovery. Your task is to provide objective, insight-focused summaries.

Guidelines:
- KEEP SUMMARIES TO 40 WORDS OR LESS
- Focus on key themes, patterns, and behavioral insights
- Identify emotional states and triggers objectively
- Note progress, challenges, or areas needing attention
- Use neutral, clinical language
- Highlight actionable insights for recovery
- Avoid overly empathetic or therapeutic language`;

        userPrompt = `Please provide an objective, insight-focused summary of this journal entry:

${content}

Summary:`;
        break;

      case 'meal':
        systemPrompt = `You are a clinical assistant analyzing meal log entries for eating disorder recovery. Your task is to provide objective, insight-focused summaries.

Guidelines:
- KEEP SUMMARIES TO 40 WORDS OR LESS
- Focus on behavioral patterns and emotional triggers around eating
- Note changes in hunger/satiety and emotional states
- Identify environmental factors (location, social context) and their impact
- Use neutral, clinical language
- Highlight patterns that could inform recovery strategies
- Avoid overly empathetic or therapeutic language`;

        userPrompt = `Please provide an objective, insight-focused summary of this meal log entry:

Meal: ${metadata.mealType || 'Unknown'}
Location: ${metadata.location || 'Unknown'}
Social Context: ${metadata.socialContext || 'Unknown'}
Description: ${content}
Before: Hunger ${metadata.satietyPre || 0}/10, Emotions: ${metadata.emotionPre?.join(', ') || 'None'}, Affect: ${metadata.affectPre || 0}/10
After: Satiety ${metadata.satietyPost || 0}/10, Emotions: ${metadata.emotionPost?.join(', ') || 'None'}, Affect: ${metadata.affectPost || 0}/10

Summary:`;
        break;

      case 'behavior':
        systemPrompt = `You are a clinical assistant analyzing behavior log entries for eating disorder recovery. Your task is to provide objective, insight-focused summaries.

Guidelines:
- KEEP SUMMARIES TO 40 WORDS OR LESS
- Focus on behavioral patterns and emotional triggers
- Note changes in emotional states and affect
- Identify potential triggers or environmental factors
- Use neutral, clinical language
- Highlight patterns that could inform recovery strategies
- Avoid overly empathetic or therapeutic language`;

        userPrompt = `Please provide an objective, insight-focused summary of this behavior log entry:

Description: ${content}
Before: Emotions: ${metadata.emotionPre?.join(', ') || 'None'}, Affect: ${metadata.affectPre || 0}/10
After: Emotions: ${metadata.emotionPost?.join(', ') || 'None'}, Affect: ${metadata.affectPost || 0}/10

Summary:`;
        break;
    }

    const fullPrompt = `${systemPrompt}

${userPrompt}`;

    console.log('Generating summary with prompt:', {
      entryType,
      contentLength: content.length,
      hasMetadata: !!metadata
    });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Generated summary:', text);
    
    return text;
  } catch (error) {
    console.error('Error generating entry summary:', error);
    throw new Error('Failed to generate summary. Please try again.');
  }
}; 