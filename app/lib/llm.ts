import { ChatMessage, buildChatPrompt, detectCrisisKeywords, getCrisisResponse } from '../prompts/prompts';

export interface LLMResponse {
  message: string;
  isCrisis: boolean;
  confidence: number;
}

export class LLMService {
  private apiKey: string;
  private baseUrl: string;
  private modelName: string;

  constructor() {
    // These would typically come from environment variables
    this.apiKey = process.env.HUGGING_FACE_API_KEY || '';
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.modelName = 'meta-llama/Llama-2-7b-chat-hf'; // Default model, can be changed
  }

  async sendMessage(messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      const lastMessage = messages[messages.length - 1];
      
      // Check for crisis keywords first
      if (lastMessage.role === 'user' && detectCrisisKeywords(lastMessage.content)) {
        return {
          message: getCrisisResponse(),
          isCrisis: true,
          confidence: 0.9
        };
      }

      // Build the prompt
      const prompt = buildChatPrompt(messages);

      // Make API call to Hugging Face
      const response = await this.callHuggingFaceAPI(prompt);
      
      return {
        message: response,
        isCrisis: false,
        confidence: 0.8
      };

    } catch (error) {
      console.error('LLM API Error:', error);
      
      // Fallback response
      return {
        message: "I'm having trouble connecting right now, but I'm still here for you. How are you feeling?",
        isCrisis: false,
        confidence: 0.5
      };
    }
  }

  private async callHuggingFaceAPI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
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

  // Method to update the model (useful for switching between different fine-tuned models)
  setModel(modelName: string): void {
    this.modelName = modelName;
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
}

export const llmService = new LLMService(); 