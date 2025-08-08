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

// Configure models for different use cases
const followUpModelConfig = {
  model: "gemma-3-12b-it", // Cost-effective for follow-up prompts
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 200,
  }
};

const summaryModelConfig = {
  model: "gemini-1.5-flash", // More powerful for clinical summaries
  generationConfig: {
    temperature: 0.3, // Lower temperature for more consistent clinical analysis
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 150, // Shorter for 40-word summaries
  }
};

console.log('Initializing models with config:', {
  followUp: followUpModelConfig,
  summary: summaryModelConfig
});

const followUpModel = genAI.getGenerativeModel(followUpModelConfig);
const summaryModel = genAI.getGenerativeModel(summaryModelConfig);

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
      modelConfig: followUpModelConfig
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
      modelConfig: followUpModelConfig,
      timestamp: new Date().toISOString(),
      conversationLength: previousPrompts.length + 1 // +1 for current response
    });

    const result = await followUpModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Log the full response from the model
    console.log('Full response from LLM:', {
      response: text,
      modelConfig: followUpModelConfig,
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
    console.log('Generating summary for entry type:', entryType, 'using powerful model');

    let systemPrompt = '';
    let userPrompt = '';

    switch (entryType) {
      case 'freeform':
      case 'module':
        systemPrompt = `You are a clinical data analyst. Your task is to create a purely factual summary of what the user stated in their journal entry.

Guidelines:
- KEEP SUMMARIES TO 30 WORDS OR LESS
- Present ONLY the facts that the user stated
- NO recommendations, suggestions, or analysis
- NO interpretations or insights
- Focus on key factual information the user shared
- Use neutral, objective language
- Include relevant contextual details the user mentioned
- Make it easy for both user and clinician to quickly understand what was shared`;

        userPrompt = `Please provide a purely factual summary of what the user stated in this journal entry:

${content}

Summary:`;
        break;

      case 'meal':
        systemPrompt = `You are a clinical data analyst. Your task is to create a purely factual summary of the user's meal and relevant contextual information.

Guidelines:
- KEEP SUMMARIES TO 30 WORDS OR LESS
- Present ONLY the facts that the user stated
- Include what they ate, where, with whom, and how they felt
- NO recommendations, suggestions, or analysis
- NO interpretations or insights
- Focus on factual details: meal type, location, social context, emotional states
- Make it easy for both user and clinician to quickly understand the meal experience`;

        userPrompt = `Please provide a purely factual summary of this meal log entry:

Meal: ${metadata.mealType || 'Unknown'}
Location: ${metadata.location || 'Unknown'}
Social Context: ${metadata.socialContext || 'Unknown'}
Description: ${content}
Before: Hunger ${metadata.satietyPre || 0}/10, Emotions: ${metadata.emotionPre?.join(', ') || 'None'}, Affect: ${metadata.affectPre || 0}/10
After: Satiety ${metadata.satietyPost || 0}/10, Emotions: ${metadata.emotionPost?.join(', ') || 'None'}, Affect: ${metadata.affectPost || 0}/10

Summary:`;
        break;

      case 'behavior':
        systemPrompt = `You are a clinical data analyst. Your task is to create a purely factual summary of the user's behavior and relevant contextual information.

Guidelines:
- KEEP SUMMARIES TO 30 WORDS OR LESS
- Present ONLY the facts that the user stated
- Include what they did, how they felt before and after
- NO recommendations, suggestions, or analysis
- NO interpretations or insights
- Focus on factual details: behavior description, emotional states
- Make it easy for both user and clinician to quickly understand what occurred`;

        userPrompt = `Please provide a purely factual summary of this behavior log entry:

Description: ${content}
Before: Emotions: ${metadata.emotionPre?.join(', ') || 'None'}, Affect: ${metadata.affectPre || 0}/10
After: Emotions: ${metadata.emotionPost?.join(', ') || 'None'}, Affect: ${metadata.affectPost || 0}/10

Summary:`;
        break;

      default:
        systemPrompt = `You are a clinical data analyst. Your task is to create a purely factual summary of what the user stated.

Guidelines:
- KEEP SUMMARIES TO 30 WORDS OR LESS
- Present ONLY the facts that the user stated
- NO recommendations, suggestions, or analysis
- Use neutral, objective language`;

        userPrompt = `Please provide a purely factual summary of what the user stated:

${content}

Summary:`;
        break;
    }

    const fullPrompt = `${systemPrompt}

${userPrompt}`;

    console.log('Generating summary with powerful model:', {
      entryType,
      contentLength: content.length,
      hasMetadata: !!metadata,
      modelConfig: summaryModelConfig
    });

    const result = await summaryModel.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Generated summary with powerful model:', text);
    
    return text;
  } catch (error) {
    console.error('Error generating entry summary:', error);
    throw new Error('Failed to generate summary. Please try again.');
  }
}; 