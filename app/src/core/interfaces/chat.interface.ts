import { ChatMessage, CrisisAssessment, CrisisResource } from '../types/chat.types';

export interface ChatService {
  sendMessage(content: string): Promise<ChatMessage>;
  getConversationHistory(): Promise<ChatMessage[]>;
  detectCrisis(content: string): CrisisAssessment;
  getCrisisResources(): CrisisResource[];
  createSession(): Promise<string>;
} 