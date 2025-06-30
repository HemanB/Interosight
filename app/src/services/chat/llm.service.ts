import { ChatMessage } from '../../core/types/chat.types';

export interface LLMConfig {
  type: 'ollama' | 'mock';
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMService {
  generateResponse(messages: ChatMessage[], context?: string): Promise<LLMResponse>;
  generateFollowUpPrompts(messages: ChatMessage[]): Promise<string[]>;
  isAvailable(): Promise<boolean>;
}

// System prompt for eating disorder recovery context
const SYSTEM_PROMPT = `You are the Stone of Wisdom, a compassionate AI companion for eating disorder recovery interactive journaling.

Your role:
- Provide empathetic, non-judgmental support
- Encourage self-reflection and exploration
- Promote recovery-focused thinking
- Keep responses concise (1-3 sentences)
- Use warm, supportive language

Guidelines:
- Never give medical advice
- Focus on listening and understanding
- Encourage professional help when needed
- Use simple, clear language
- Be encouraging and supportive

Crisis: If user expresses self-harm or severe distress, provide crisis resources immediately.

Response style: Warm, brief, and supportive.`;

export class OllamaLLMService implements LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = {
      baseUrl: 'http://localhost:11434',
      model: 'llama3.2:latest',
      temperature: 0.7,
      maxTokens: 1000,
      ...config
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      console.log('[LLM DEBUG] Checking if Ollama is available...');
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      const isAvailable = response.ok;
      console.log('[LLM DEBUG] Ollama available:', isAvailable);
      return isAvailable;
    } catch (error) {
      console.log('[LLM DEBUG] Ollama not available:', (error as Error).message);
      return false;
    }
  }

  async generateResponse(messages: ChatMessage[], context?: string): Promise<LLMResponse> {
    try {
      console.log('[LLM DEBUG] Generating response with Ollama...');
      const prompt = this.buildPrompt(messages, context);
      
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false
        })
      });

      if (!response.ok) {
        console.error('[LLM ERROR]', response.status, response.statusText);
        const errorText = await response.text();
        console.error('[LLM ERROR] Response body:', errorText);
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[LLM DEBUG] Ollama response received');
      return {
        content: data.response.trim(),
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        }
      };
    } catch (error) {
      console.error('[LLM ERROR] Failed to generate response:', error);
      throw error;
    }
  }

  private buildPrompt(messages: ChatMessage[], context?: string): string {
    let prompt = SYSTEM_PROMPT + '\n\n';
    
    if (context) {
      prompt += `Context: ${context}\n\n`;
    }
    
    prompt += 'Conversation History:\n';
    
    messages.forEach(message => {
      const role = message.isUser ? 'User' : 'Stone of Wisdom';
      prompt += `${role}: ${message.content}\n`;
    });
    
    prompt += '\nStone of Wisdom:';
    
    return prompt;
  }

  async generateFollowUpPrompts(messages: ChatMessage[]): Promise<string[]> {
    // Debug log to verify messages array
    const lastUserMessage = messages.filter(m => m.isUser).pop();
    if (lastUserMessage) {
      console.log('[LLM DEBUG] User input for follow-up prompts:', lastUserMessage.content);
    } else {
      console.log('[LLM DEBUG] No user message found for follow-up prompts.');
    }

    // Build a cleaner, more direct prompt
    let prompt = '';
    
    if (lastUserMessage) {
      prompt += `USER INPUT: "${lastUserMessage.content}"\n\n`;
    }
    
    prompt += `You are a supportive AI companion helping with reflection and self-discovery.

TASK: Based on the user's message above, generate exactly 3 thoughtful follow-up questions to help them explore their thoughts and feelings.

GUIDELINES:
- Create 3 questions that encourage deeper reflection
- Each question should end with a question mark
- One question per line
- Keep questions supportive and non-judgmental
- Focus on understanding and exploration

FORMAT:
Question 1?
Question 2?
Question 3?`;

    // Log the full prompt for debugging
    console.log('\n[LLM FULL PROMPT SENT TO OLLAMA]');
    console.log(prompt);

    const requestBody = {
      model: this.config.model,
      prompt,
      stream: false
    };

    console.log('[LLM DEBUG] Request body being sent:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('[LLM ERROR]', response.status, response.statusText);
      const errorText = await response.text();
      console.error('[LLM ERROR] Response body:', errorText);
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // Log the raw response for debugging
    console.log('\n[LLM RAW RESPONSE]');
    console.log(data.response);

    const responseText = data.response.trim();
    
    // Parse the response into individual questions
    const questions = responseText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => {
        // Only keep lines that:
        // 1. Are not empty
        // 2. End with a question mark
        // 3. Don't contain explanatory phrases
        // 4. Are not preambles
        // 5. Don't contain conversation markers
        const isNotEmpty = line.length > 0;
        const isQuestion = line.endsWith('?');
        const isNotExplanatory = !line.toLowerCase().includes('here are') && 
                                !line.toLowerCase().includes('following') &&
                                !line.toLowerCase().includes('questions') &&
                                !line.toLowerCase().includes('reflection') &&
                                !line.toLowerCase().includes('generated');
        const isNotPreamble = !line.toLowerCase().includes('stone of wisdom') &&
                             !line.toLowerCase().includes('generate') &&
                             !line.toLowerCase().includes('task') &&
                             !line.toLowerCase().includes('instructions');
        const isNotConversation = !line.includes('| im_start|') &&
                                 !line.includes('| im_end|') &&
                                 !line.includes('>user') &&
                                 !line.includes('>assistant') &&
                                 !line.includes('user:') &&
                                 !line.includes('assistant:');
        
        return isNotEmpty && isQuestion && isNotExplanatory && isNotPreamble && isNotConversation;
      })
      .slice(0, 3); // Take only first 3 questions
    
    console.log('[LLM DEBUG] Parsed questions:', questions);
    
    // If we don't get 3 questions, provide fallback questions
    while (questions.length < 3) {
      const fallbackQuestions = [
        'How does that make you feel?',
        'What else is on your mind?',
        'How are you feeling about this?'
      ];
      questions.push(fallbackQuestions[questions.length]);
    }
    
    return questions;
  }
}

export class MockLLMService implements LLMService {
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateResponse(messages: ChatMessage[], context?: string): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lastMessage = messages[messages.length - 1];
    const isCrisis = this.detectCrisisKeywords(lastMessage.content);

    let response: string;
    if (isCrisis) {
      response = "I'm concerned about what you're sharing. Your safety is the most important thing. Please consider reaching out to a crisis hotline or a mental health professional immediately. You're not alone, and there are people who want to help you.";
    } else {
      const responses = [
        "Thank you for sharing that with me. I'm here to listen and support you on your recovery journey.",
        "I appreciate you opening up about this. It takes courage to be vulnerable, and I want you to know that your feelings are valid.",
        "That sounds really challenging. I'm here to support you as you navigate this difficult time in your recovery.",
        "I can hear how much you're working through right now. Remember that progress isn't always linear, and it's okay to have difficult moments.",
        "Thank you for trusting me with this. Your journey is unique, and I'm here to walk alongside you with compassion and understanding."
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
      content: response,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    };
  }

  private detectCrisisKeywords(content: string): boolean {
    const crisisKeywords = [
      'suicide', 'kill myself', 'want to die', 'end it all', 'no reason to live',
      'self-harm', 'cut myself', 'hurt myself', 'better off dead', 'give up',
      'hopeless', 'worthless', 'no point', 'can\'t take it anymore'
    ];
    
    const lowerContent = content.toLowerCase();
    return crisisKeywords.some(keyword => lowerContent.includes(keyword));
  }

  async generateFollowUpPrompts(messages: ChatMessage[]): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return fallback questions for mock service
    return [
      'Error: Follow-up prompts not available for mock service',
      'Error: Follow-up prompts not available for mock service',
      'Error: Follow-up prompts not available for mock service'
    ];
  }
}

// Factory function to create the appropriate LLM service
export function createLLMService(config: LLMConfig): LLMService {
  switch (config.type) {
    case 'ollama':
      return new OllamaLLMService(config);
    case 'mock':
    default:
      return new MockLLMService();
  }
}

// Default configuration
export const defaultLLMConfig: LLMConfig = {
  type: 'ollama',
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2:latest',
  temperature: 0.7,
  maxTokens: 1000,
}; 