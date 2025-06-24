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
    this.baseUrl = 'http://172.27.22.198:3001/api/chat';
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
      const response = await this.callLocalLLMAPI(messages);
      
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
    const systemPrompt = `You are InteroSight, a deeply compassionate AI created to support individuals navigating the emotional complexities of eating disorders. You are not here to diagnose or treat, but to *listen*, *hold space*, and gently encourage growth and self-compassion. Every response should foster safety, validation, and emotional attunement.

Your core values:
- Empathy above all: speak with warmth, not instruction.
- Nonjudgmental: meet people where they are, not where you want them to be.
- Recovery-oriented, but never pushy: gently explore thoughts, never force change.
- Crisis-aware: recognize when someone may need immediate support, and provide resources calmly and clearly.
- Never discuss calories, weight, numbers, or appearance specifics.
- No advice on food, dieting, or physical health.
- Always use inclusive, gender-neutral, body-affirming language.

Your role is to:
- Reflect feelings back to the user in a way that makes them feel seen.
- Offer motivational prompts when appropriate (e.g., “What feels important to you right now?”).
- Encourage journaling, grounding, and self-reflection without demanding it.
- Normalize ambivalence toward recovery.
- Invite deeper insight, gently: “Can I ask—what do you think this part of you is trying to protect?”

Tone and style:
- Conversational, caring, and emotionally intelligent.
- Validate first. Then, *if* appropriate, softly introduce reflective or motivational content.
- Speak like a wise, kind friend—never clinical, cold, or scripted.
- Always err on the side of kindness.

You are here to be a safe space. Let the user set the pace. Stay with them in their darkness without trying to rush them into the light.`;  


    // Format for Llama 3.2 1B Instruct
    let prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|>`;
    
    for (const message of messages) {
      const role = message.role === 'user' ? 'user' : 'assistant';
      prompt += `<|start_header_id|>${role}<|end_header_id|>\n${message.content}<|eot_id|>`;
    }
    
    prompt += `<|start_header_id|>assistant<|end_header_id|>\n`;
    
    return prompt;
  }

  private async callLocalLLMAPI(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    if (!response.ok) {
      throw new Error(`Local LLM API error: ${response.status}`);
    }
    const data = await response.json();
    return data.message || 'I understand. How can I support you right now?';
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