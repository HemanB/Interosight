import { ChatService } from '../../core/interfaces/chat.interface';
import { ChatMessage, CrisisAssessment, CrisisResource } from '../../core/types/chat.types';

export class MockChatService implements ChatService {
  private currentSessionId: string | null = null;

  async sendMessage(content: string): Promise<ChatMessage> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const sessionId = this.currentSessionId || await this.createSession();
    
    // Simple crisis detection
    const crisisAssessment = this.detectCrisis(content);
    
    // Generate mock response based on crisis detection
    let response: string;
    if (crisisAssessment.isCrisis) {
      response = "I'm concerned about what you're sharing. Your safety is the most important thing. Please consider reaching out to a crisis hotline or a mental health professional immediately. You're not alone, and there are people who want to help you.";
    } else {
      response = "Thank you for sharing that with me. I'm here to listen and support you on your recovery journey. What would you like to explore further?";
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: response,
      isUser: false,
      timestamp: new Date(),
      sessionId,
    };

    return message;
  }

  async getConversationHistory(): Promise<ChatMessage[]> {
    // Mock conversation history
    return [];
  }

  detectCrisis(content: string): CrisisAssessment {
    const crisisKeywords = [
      'suicide', 'kill myself', 'want to die', 'end it all', 'no reason to live',
      'self-harm', 'cut myself', 'hurt myself', 'better off dead', 'give up',
      'hopeless', 'worthless', 'no point', 'can\'t take it anymore'
    ];

    const lowerContent = content.toLowerCase();
    const foundKeywords = crisisKeywords.filter(keyword => 
      lowerContent.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      return {
        isCrisis: true,
        severity: foundKeywords.length > 2 ? 'high' : 'medium',
        keywords: foundKeywords,
        suggestedActions: [
          'Contact a crisis hotline immediately',
          'Reach out to a mental health professional',
          'Talk to a trusted friend or family member',
          'Go to the nearest emergency room if needed'
        ]
      };
    }

    return {
      isCrisis: false,
      severity: 'low',
      keywords: [],
      suggestedActions: []
    };
  }

  getCrisisResources(): CrisisResource[] {
    return [
      {
        id: '1',
        title: 'National Suicide Prevention Lifeline',
        description: '24/7 crisis support',
        type: 'hotline',
        contact: '988',
      },
      {
        id: '2',
        title: 'Crisis Text Line',
        description: 'Text for crisis support',
        type: 'hotline',
        contact: 'Text HOME to 741741',
      },
      {
        id: '3',
        title: 'DBT Distress Tolerance',
        description: 'Skills for managing crisis moments',
        type: 'dbt',
      },
      {
        id: '4',
        title: 'Grounding Exercises',
        description: 'Techniques to stay present',
        type: 'grounding',
      }
    ];
  }

  async createSession(): Promise<string> {
    this.currentSessionId = `session_${Date.now()}`;
    return this.currentSessionId;
  }
}

export const chatService = new MockChatService(); 