import { ChatService } from '../../core/interfaces/chat.interface';
import { ChatMessage } from '../../core/types/chat.types';
import { createLLMService, LLMService } from './llm.service';
import { getLLMConfig } from '../../core/config/llm.config';

export class MinimalChatService implements ChatService {
  private llmService: LLMService;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.llmService = createLLMService(getLLMConfig());
  }

  async sendMessage(content: string): Promise<ChatMessage> {
    // Add user message to conversation history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
      sessionId: '',
    };
    this.conversationHistory.push(userMessage);

    // Get LLM response
    const llmResponse = await this.llmService.generateResponse(this.conversationHistory);
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: llmResponse.content,
      isUser: false,
      timestamp: new Date(),
      sessionId: '',
    };
    this.conversationHistory.push(aiMessage);
    return aiMessage;
  }

  async getConversationHistory(): Promise<ChatMessage[]> {
    return this.conversationHistory;
  }

  detectCrisis(content: string): CrisisAssessment {
    return { isCrisis: false, severity: 'low', keywords: [], suggestedActions: [] };
  }

  getCrisisResources() {
    return [];
  }

  async createSession(): Promise<string> {
    return '';
  }

  async generatePrompts(messagesArray: ChatMessage[]): Promise<string[]> {
    // Use the provided messages array for prompt generation
    return await this.llmService.generateFollowUpPrompts(messagesArray);
  }
}

export const chatService = new MinimalChatService(); 