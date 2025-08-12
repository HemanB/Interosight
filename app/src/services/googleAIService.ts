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
  model: "gemini-1.5-flash", // Cost-effective for clinical summaries
  generationConfig: {
    temperature: 0.3, // Lower temperature for more consistent clinical analysis
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 150, // Shorter for 30-word summaries
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
      .map((p) => {
        if (p.type === 'module_journal') {
          return `User: ${p.content}`;
        } else {
          return `Assistant: ${p.content}`;
        }
      })
      .join('\n');

    const prompt = `You are a therapeutic journaling assistant specializing in eating disorder recovery and mental health support. Your goal is to help users explore their thoughts, feelings, and experiences more deeply in a safe, supportive environment.

Initial prompt: "${originalPrompt}"

Conversation history:
${conversationHistory}
User: ${userResponse}

Based on the complete conversation history above, generate a follow-up question that:
1. Builds on the user's ENTIRE response chain, not just their last response
2. Shows deep understanding of the conversation's emotional progression
3. Encourages deeper self-reflection and insight
4. Is empathetic, supportive, and trauma-informed
5. Avoids being directive, prescriptive, or judgmental
6. Uses open-ended, exploratory phrasing
7. Is 1-2 sentences long and feels natural
8. Does not repeat previous questions unless deliberately building upon them
9. Recognizes patterns in eating disorders, body image, emotions, or behaviors when relevant
10. Maintains therapeutic boundaries while being warm and encouraging

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
        systemPrompt = `You are a clinical data analyst specializing in therapeutic journaling. Your task is to create a factual summary of the user's journal entry that captures the essence of their thoughts, feelings, and experiences.

Guidelines:
- KEEP SUMMARIES TO 30 WORDS OR LESS
- Be sensitive to mental health and emotional vulnerability
- Present ONLY the facts, thoughts, and feelings the user explicitly stated
- Include key themes, emotions, insights, or experiences they shared
- NO recommendations, suggestions, or clinical analysis
- NO interpretations beyond what the user directly expressed
- Use empathetic but objective language
- Focus on what the user revealed about their internal experience
- Make it easy for both user and clinician to quickly understand the entry's core content
- Preserve the user's voice and perspective`;

        userPrompt = `Please provide a factual summary of what the user shared in this journal entry:

${content}

Summary:`;
        break;

      case 'meal':
        systemPrompt = `You are a clinical data analyst specializing in eating disorder recovery. Your task is to create a factual summary of the user's meal experience and relevant contextual information.

Guidelines:
- KEEP SUMMARIES TO 30 WORDS OR LESS
- Be sensitive to eating disorders and the user's relationship with food
- Present ONLY the facts that the user stated about their meal experience
- Include what they ate, where, with whom, and their emotional journey
- Recognize patterns like emotional eating, social eating, or restrictive behaviors
- NO recommendations, suggestions, or analysis
- NO interpretations beyond what the user directly expressed
- Focus on factual details: meal type, location, social context, emotional states before/after
- Make it easy for both user and clinician to quickly understand the meal experience
- Be mindful of triggers and use neutral, supportive language`;

        userPrompt = `Please provide a factual summary of this meal log entry:

Meal: ${metadata.mealType || 'Unknown'}
Location: ${metadata.location || 'Unknown'}
Social Context: ${metadata.socialContext || 'Unknown'}
Description: ${content}
Before: Hunger ${metadata.satietyPre || 0}/10, Emotions: ${metadata.emotionPre?.join(', ') || 'None'}, Affect: ${metadata.affectPre || 0}/10
After: Satiety ${metadata.satietyPost || 0}/10, Emotions: ${metadata.emotionPost?.join(', ') || 'None'}, Affect: ${metadata.affectPost || 0}/10

Summary:`;
        break;

      case 'behavior':
        systemPrompt = `You are a clinical data analyst specializing in eating disorder recovery and behavioral health. Your task is to create a factual summary of the user's behavior and relevant contextual information for both the user and the clinician to reference in the future.

Guidelines:
- KEEP SUMMARIES TO 30 WORDS OR LESS
- Be sensitive to eating disorders and the user's experience
- Recognize patterns like body dysmorphia, calorie counting, compulsive behaviors, exercise patterns, etc.
- Present ONLY the facts that the user stated about their behavior
- Include what they did, how they felt before and after, and any triggers they identified
- NO recommendations, suggestions, or analysis
- NO interpretations beyond what the user directly expressed
- Focus on factual details: behavior description, emotional states, environmental context
- Make it easy for both user and clinician to quickly understand what occurred
- Use neutral, non-judgmental language while being clinically accurate`;

        userPrompt = `Please provide a factual summary of this behavior log entry:

Description: ${content}
Before: Emotions: ${metadata.emotionPre?.join(', ') || 'None'}, Affect: ${metadata.affectPre || 0}/10
After: Emotions: ${metadata.emotionPost?.join(', ') || 'None'}, Affect: ${metadata.affectPost || 0}/10

Summary:`;
        break;

      default:
        systemPrompt = `You are a clinical data analyst specializing in mental health and wellness. Your task is to create a factual summary of what the user stated in their entry.

Guidelines:
- KEEP SUMMARIES TO 30 WORDS OR LESS
- Be sensitive to mental health and emotional vulnerability
- Present ONLY the facts, thoughts, and feelings the user explicitly stated
- NO recommendations, suggestions, or analysis
- NO interpretations beyond what the user directly expressed
- Use empathetic but objective language
- Focus on the core content and context the user shared
- Make it easy for both user and clinician to quickly understand the entry`;

        userPrompt = `Please provide a factual summary of what the user stated:

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