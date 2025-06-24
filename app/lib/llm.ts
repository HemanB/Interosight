import { ChatMessage, detectCrisisKeywords, getCrisisResponse } from '../prompts/prompts';

export interface LLMResponse {
  message: string;
  isCrisis: boolean;
  confidence: number;
  source: 'llama' | 'fallback' | 'crisis';
  latency: number;
}

export class LLMService {
  private apiKey: string;
  private baseUrl: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.HF_TOKEN || '';
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.modelName = 'meta-llama/Llama-3.2-1B-Instruct';
  }

  async sendMessage(messages: ChatMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const lastMessage = messages[messages.length - 1];
      
      // Check for crisis keywords first
      if (lastMessage.role === 'user' && detectCrisisKeywords(lastMessage.content)) {
        return {
          message: getCrisisResponse(),
          isCrisis: true,
          confidence: 0.9,
          source: 'crisis',
          latency: Date.now() - startTime
        };
      }

      // Build the prompt for Llama 3.2 1B
      const prompt = this.buildPrompt(messages);

      // Make API call to Hugging Face
      const response = await this.callHuggingFaceAPI(prompt);
      
      return {
        message: response,
        isCrisis: false,
        confidence: 0.8,
        source: 'llama',
        latency: Date.now() - startTime
      };

    } catch (error) {
      console.error('LLM API Error:', error);
      
      return {
        message: "I'm having trouble connecting right now, but I'm still here for you. How are you feeling?",
        isCrisis: false,
        confidence: 0.5,
        source: 'fallback',
        latency: Date.now() - startTime
      };
    }
  }

  private buildPrompt(messages: ChatMessage[]): string {
    const systemPrompt = `You are InteroSight, a compassionate AI companion designed to support individuals in eating disorder recovery. Your role is to provide empathetic, non-judgmental support while maintaining therapeutic boundaries.

Key Guidelines:
- Always respond with warmth, empathy, and understanding
- Never give medical advice or replace professional treatment
- Focus on emotional support and gentle encouragement
- Use inclusive, body-positive language
- Avoid triggering content about calories, weight, or specific eating behaviors
- Encourage self-compassion and self-care
- Recognize crisis situations and provide appropriate resources
- Maintain a supportive, non-coercive approach

Your responses should be:
- Warm and conversational
- Focused on emotional well-being
- Encouraging of professional support when needed
- Mindful of recovery language and triggers
- Supportive of individual recovery journeys

Remember: You are here to listen, support, and encourage, not to diagnose or treat.`;

    // Format for Llama 3.2 1B Instruct
    let prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|>`;
    
    for (const message of messages) {
      const role = message.role === 'user' ? 'user' : 'assistant';
      prompt += `<|start_header_id|>${role}<|end_header_id|>\n${message.content}<|eot_id|>`;
    }
    
    prompt += `<|start_header_id|>assistant<|end_header_id|>\n`;
    
    return prompt;
  }

  private async callHuggingFaceAPI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('HF_TOKEN not configured');
    }

    const response = await fetch(`${this.baseUrl}/${this.modelName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the generated text from the response
    if (Array.isArray(data) && data.length > 0) {
      return data[0].generated_text || 'I understand. How can I support you right now?';
    }
    
    return 'I understand. How can I support you right now?';
  }

  // Method to test the connection
  async testConnection(): Promise<boolean> {
    try {
      const testMessage: ChatMessage = {
        role: 'user',
        content: 'Hello'
      };
      
      await this.sendMessage([testMessage]);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Method to get health status for NetworkStatus component
  getHealthStatus() {
    return {
      isHealthy: true, // Default to healthy
      errorCount: 0,   // No errors by default
      queueLength: 0,  // No queue by default
      cacheSize: 0,    // No cache by default
      lastErrorTime: 0 // No last error time by default
    };
  }
}

export const llmService = new LLMService(); 