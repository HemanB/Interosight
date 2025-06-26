import AsyncStorage from '@react-native-async-storage/async-storage';

// Simplified interfaces
export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

export interface ChatPrompt {
  id: string;
  title: string;
  description: string;
  initialMessage: string;
  category: 'recovery' | 'crisis' | 'daily' | 'reflection' | 'coping';
  tags: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  promptId: string;
  messages: ChatMessage[];
  startedAt: Date;
  lastActivityAt: Date;
}

// Simplified chat service
export class ChatService {
  private readonly CHAT_SESSIONS_KEY = 'chatSessions';
  private readonly CHAT_PROMPTS_KEY = 'chatPrompts';

  constructor() {
    console.log('ChatService: Initialized');
    this.initializeDefaultPrompts();
  }

  // Initialize default prompts
  private async initializeDefaultPrompts() {
    try {
      const existingPrompts = await this.getPrompts();
      if (existingPrompts.length === 0) {
        const defaultPrompts: ChatPrompt[] = [
          {
            id: 'daily-reflection',
            title: 'Daily Reflection',
            description: 'Begin your day with mindful awareness',
            initialMessage: 'Greetings, seeker of wisdom. As the sun rises on a new day, what thoughts stir within your heart? Share with me the whispers of your soul, and together we shall explore the path of healing.',
            category: 'daily',
            tags: ['reflection', 'morning', 'mindfulness']
          },
          {
            id: 'recovery-journey',
            title: 'Recovery Journey',
            description: 'Explore your healing path',
            initialMessage: 'Ah, a brave soul walking the path of recovery. Every step you take, no matter how small, is a victory. Tell me of your journey - the challenges you face, the victories you celebrate, and the wisdom you\'ve gathered along the way.',
            category: 'recovery',
            tags: ['healing', 'progress', 'strength']
          },
          {
            id: 'crisis-support',
            title: 'Crisis Support',
            description: 'Find strength in difficult moments',
            initialMessage: 'I sense the storm within you, dear one. In moments of darkness, remember that you are not alone. Share what weighs heavy on your heart, and let us find the light together.',
            category: 'crisis',
            tags: ['support', 'crisis', 'comfort']
          },
          {
            id: 'coping-strategies',
            title: 'Coping Strategies',
            description: 'Discover tools for difficult moments',
            initialMessage: 'The ancient scrolls speak of many paths through darkness. What challenges do you face today? Together, we shall uncover the tools that lie within your own strength.',
            category: 'coping',
            tags: ['tools', 'strategies', 'resilience']
          },
          {
            id: 'gratitude-practice',
            title: 'Gratitude Practice',
            description: 'Cultivate appreciation and joy',
            initialMessage: 'In the garden of your heart, what flowers bloom today? Even in the harshest winter, there are seeds of gratitude waiting to be discovered. Share with me the moments that bring light to your soul.',
            category: 'reflection',
            tags: ['gratitude', 'joy', 'appreciation']
          }
        ];

        await AsyncStorage.setItem(this.CHAT_PROMPTS_KEY, JSON.stringify(defaultPrompts));
        console.log('ChatService: Default prompts initialized');
      }
    } catch (error) {
      console.error('ChatService: Error initializing prompts:', error);
    }
  }

  // Get all available prompts
  async getPrompts(): Promise<ChatPrompt[]> {
    try {
      const storedPrompts = await AsyncStorage.getItem(this.CHAT_PROMPTS_KEY);
      if (storedPrompts) {
        return JSON.parse(storedPrompts);
      }
      return [];
    } catch (error) {
      console.error('ChatService: Error getting prompts:', error);
      return [];
    }
  }

  // Create a new chat session
  async createSession(userId: string, promptId: string): Promise<ChatSession> {
    try {
      const session: ChatSession = {
        id: Date.now().toString(),
        userId,
        promptId,
        messages: [],
        startedAt: new Date(),
        lastActivityAt: new Date(),
      };

      const existingSessions = await this.getSessions(userId);
      const updatedSessions = [...existingSessions, session];
      await AsyncStorage.setItem(`${this.CHAT_SESSIONS_KEY}_${userId}`, JSON.stringify(updatedSessions));

      console.log('ChatService: New session created');
      return session;
    } catch (error) {
      console.error('ChatService: Error creating session:', error);
      throw error;
    }
  }

  // Get user's chat sessions
  async getSessions(userId: string): Promise<ChatSession[]> {
    try {
      const storedSessions = await AsyncStorage.getItem(`${this.CHAT_SESSIONS_KEY}_${userId}`);
      if (storedSessions) {
        const sessions = JSON.parse(storedSessions);
        return sessions.map((session: any) => ({
          ...session,
          startedAt: new Date(session.startedAt),
          lastActivityAt: new Date(session.lastActivityAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
      return [];
    } catch (error) {
      console.error('ChatService: Error getting sessions:', error);
      return [];
    }
  }

  // Add message to session
  async addMessage(userId: string, sessionId: string, content: string, isUser: boolean = true): Promise<ChatMessage> {
    try {
      const sessions = await this.getSessions(userId);
      const sessionIndex = sessions.findIndex(session => session.id === sessionId);
      
      if (sessionIndex === -1) {
        throw new Error('Session not found');
      }

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        timestamp: new Date(),
        isUser,
      };

      sessions[sessionIndex].messages.push(newMessage);
      sessions[sessionIndex].lastActivityAt = new Date();

      await AsyncStorage.setItem(`${this.CHAT_SESSIONS_KEY}_${userId}`, JSON.stringify(sessions));

      console.log('ChatService: Message added to session');
      return newMessage;
    } catch (error) {
      console.error('ChatService: Error adding message:', error);
      throw error;
    }
  }

  // Generate AI response (mock for now)
  async generateResponse(userId: string, sessionId: string, userMessage: string): Promise<ChatMessage> {
    try {
      // Mock AI response - in real implementation, this would call your LLM
      const responses = [
        "Your words carry the weight of truth, dear seeker. In sharing your struggles, you demonstrate remarkable courage. Remember, healing is not a straight path, but a journey of discovery.",
        "I hear the wisdom in your words. Every challenge you face is an opportunity to discover your own strength. What would it feel like to approach this situation with compassion for yourself?",
        "The ancient scrolls speak of resilience like yours. You are stronger than you know, and every step forward, no matter how small, is a victory worth celebrating.",
        "Your journey is uniquely yours, and there is no timeline for healing. What matters most is that you continue to show up for yourself, day after day.",
        "In the garden of recovery, every seed of hope you plant matters. Your feelings are valid, and your experiences are teaching you valuable lessons about your own strength."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage = await this.addMessage(userId, sessionId, randomResponse, false);
      
      console.log('ChatService: AI response generated');
      return aiMessage;
    } catch (error) {
      console.error('ChatService: Error generating response:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService(); 