export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CrisisAssessment {
  isCrisis: boolean;
  severity: 'low' | 'medium' | 'high';
  keywords: string[];
  suggestedActions: string[];
}

export interface CrisisResource {
  id: string;
  title: string;
  description: string;
  type: 'hotline' | 'dbt' | 'grounding' | 'professional';
  contact?: string;
  url?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  currentSession: string | null;
  loading: boolean;
  error: string | null;
  crisisDetected: boolean;
}

export interface PromptOption {
  id: string;
  text: string;
  selected: boolean;
} 