import { ChatMessage, buildChatPrompt, detectCrisisKeywords, getCrisisResponse } from '../prompts/prompts';

export interface OnDeviceLLMResponse {
  message: string;
  isCrisis: boolean;
  confidence: number;
  source: 'local' | 'fallback' | 'crisis';
  latency: number;
  model: string;
}

export interface OnDeviceLLMConfig {
  modelName: string;
  modelPath: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  cacheEnabled: boolean;
  cacheExpiryMinutes: number;
}

class OnDeviceLLMCache {
  private cache = new Map<string, { message: string; timestamp: number; confidence: number }>();
  private expiryMinutes: number;

  constructor(expiryMinutes: number = 30) {
    this.expiryMinutes = expiryMinutes;
  }

  private generateKey(messages: ChatMessage[]): string {
    const conversation = messages.map(msg => `${msg.role}:${msg.content}`).join('|');
    return btoa(conversation).slice(0, 50);
  }

  get(messages: ChatMessage[]): { message: string; confidence: number } | null {
    const key = this.generateKey(messages);
    const cached = this.cache.get(key);
    
    if (!cached) return null;

    const now = Date.now();
    const expiryTime = cached.timestamp + (this.expiryMinutes * 60 * 1000);
    
    if (now > expiryTime) {
      this.cache.delete(key);
      return null;
    }

    return { message: cached.message, confidence: cached.confidence };
  }

  set(messages: ChatMessage[], response: string, confidence: number): void {
    const key = this.generateKey(messages);
    this.cache.set(key, {
      message: response,
      timestamp: Date.now(),
      confidence
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

export class OnDeviceLLMService {
  private config: OnDeviceLLMConfig;
  private cache: OnDeviceLLMCache;
  private model: any = null;
  private isModelLoaded = false;
  private isLoading = false;

  constructor(config?: Partial<OnDeviceLLMConfig>) {
    this.config = {
      modelName: 'llama-3.2-1b-instruct',
      modelPath: 'assets/models/llama-3.2-1b-instruct.tflite',
      maxTokens: 500,
      temperature: 0.7,
      topP: 0.9,
      cacheEnabled: true,
      cacheExpiryMinutes: 30,
      ...config
    };

    this.cache = new OnDeviceLLMCache(this.config.cacheExpiryMinutes);
  }

  async initialize(): Promise<boolean> {
    if (this.isModelLoaded || this.isLoading) {
      return this.isModelLoaded;
    }

    this.isLoading = true;
    
    try {
      console.log('🤖 Loading on-device LLM model...');
      
      // Check if TensorFlow Lite is available
      if (!this.isTensorFlowLiteAvailable()) {
        console.warn('TensorFlow Lite not available, using fallback mode');
        this.isModelLoaded = false;
        return false;
      }

      // Load the model
      await this.loadModel();
      
      this.isModelLoaded = true;
      console.log('✅ On-device LLM model loaded successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to load on-device LLM model:', error);
      this.isModelLoaded = false;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  private isTensorFlowLiteAvailable(): boolean {
    // Check if TensorFlow Lite is available in the environment
    // This would depend on the specific TensorFlow Lite React Native package
    try {
      // Placeholder for TensorFlow Lite availability check
      return false; // For now, assume not available
    } catch {
      return false;
    }
  }

  private async loadModel(): Promise<void> {
    // This would load the TensorFlow Lite model
    // Implementation depends on the specific TensorFlow Lite package used
    throw new Error('TensorFlow Lite implementation required');
  }

  async sendMessage(messages: ChatMessage[]): Promise<OnDeviceLLMResponse> {
    const startTime = Date.now();

    try {
      const lastMessage = messages[messages.length - 1];
      
      // Check for crisis keywords first (highest priority)
      if (lastMessage.role === 'user' && detectCrisisKeywords(lastMessage.content)) {
        return {
          message: getCrisisResponse(),
          isCrisis: true,
          confidence: 0.9,
          source: 'crisis',
          latency: Date.now() - startTime,
          model: this.config.modelName
        };
      }

      // Check cache first
      if (this.config.cacheEnabled) {
        const cached = this.cache.get(messages);
        if (cached) {
          return {
            message: cached.message,
            isCrisis: false,
            confidence: cached.confidence,
            source: 'local',
            latency: Date.now() - startTime,
            model: this.config.modelName
          };
        }
      }

      // Try to use on-device model if available
      if (this.isModelLoaded) {
        return await this.generateWithLocalModel(messages, startTime);
      }

      // Fallback to rule-based responses
      return this.generateFallbackResponse(messages, startTime);

    } catch (error) {
      console.error('On-device LLM Error:', error);
      
      return {
        message: this.getFallbackResponse(),
        isCrisis: false,
        confidence: 0.5,
        source: 'fallback',
        latency: Date.now() - startTime,
        model: this.config.modelName
      };
    }
  }

  private async generateWithLocalModel(messages: ChatMessage[], startTime: number): Promise<OnDeviceLLMResponse> {
    try {
      const prompt = this.buildPrompt(messages);
      
      // This would use TensorFlow Lite to generate the response
      // Implementation depends on the specific TensorFlow Lite package
      const response = await this.runInference(prompt);
      
      const latency = Date.now() - startTime;
      
      // Cache the response
      if (this.config.cacheEnabled) {
        this.cache.set(messages, response, 0.8);
      }

      return {
        message: response,
        isCrisis: false,
        confidence: 0.8,
        source: 'local',
        latency,
        model: this.config.modelName
      };

    } catch (error) {
      console.error('Local model inference failed:', error);
      return this.generateFallbackResponse(messages, startTime);
    }
  }

  private async runInference(prompt: string): Promise<string> {
    // This would run the actual TensorFlow Lite inference
    // For now, return a placeholder
    throw new Error('TensorFlow Lite inference not implemented');
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

  private generateFallbackResponse(messages: ChatMessage[], startTime: number): OnDeviceLLMResponse {
    const lastMessage = messages[messages.length - 1];
    const response = this.getContextualFallbackResponse(lastMessage.content);
    
    return {
      message: response,
      isCrisis: false,
      confidence: 0.6,
      source: 'fallback',
      latency: Date.now() - startTime,
      model: this.config.modelName
    };
  }

  private getContextualFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware fallback responses
    if (lowerMessage.includes('meal') || lowerMessage.includes('eat') || lowerMessage.includes('food')) {
      return "I hear that meal times can be challenging. Remember that every meal is a step toward healing, no matter how small it feels. What's making this meal particularly difficult for you right now?";
    }
    
    if (lowerMessage.includes('body') || lowerMessage.includes('weight') || lowerMessage.includes('look')) {
      return "I understand that body image can be really difficult. You are so much more than how you look. What would it feel like to offer yourself the same compassion you give others?";
    }
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
      return "Anxiety can feel overwhelming. It's completely normal to feel this way. What might help you feel a little more grounded right now?";
    }
    
    if (lowerMessage.includes('recovery') || lowerMessage.includes('heal') || lowerMessage.includes('better')) {
      return "Recovery is a journey, and every step you take matters. Even the small victories are worth celebrating. What's one thing you're proud of today, no matter how small?";
    }
    
    // Default empathetic response
    return "I hear you, and I'm here to listen. What would be most helpful for you right now?";
  }

  private getFallbackResponse(): string {
    const fallbackResponses = [
      "I'm having trouble connecting right now, but I'm still here for you. How are you feeling?",
      "I want to make sure I'm giving you my full attention. Could you tell me more about what's on your mind?",
      "I hear you, and I'm here to listen. What would be most helpful for you right now?",
      "Thank you for sharing that with me. How can I best support you in this moment?",
      "I'm here to listen and support you. What's coming up for you right now?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  // Health and monitoring methods
  getHealthStatus(): {
    isModelLoaded: boolean;
    isLoading: boolean;
    cacheSize: number;
    modelName: string;
  } {
    return {
      isModelLoaded: this.isModelLoaded,
      isLoading: this.isLoading,
      cacheSize: this.cache.getSize(),
      modelName: this.config.modelName
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  async testConnection(): Promise<boolean> {
    try {
      const testMessage: ChatMessage = {
        role: 'user',
        content: 'Hello'
      };
      
      await this.sendMessage([testMessage]);
      return true;
    } catch (error) {
      console.error('On-device LLM test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const onDeviceLLMService = new OnDeviceLLMService(); 