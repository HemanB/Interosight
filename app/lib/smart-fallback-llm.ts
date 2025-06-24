import { ChatMessage, detectCrisisKeywords, getCrisisResponse } from '../prompts/prompts';

export interface SmartFallbackResponse {
  message: string;
  isCrisis: boolean;
  confidence: number;
  source: 'smart-fallback' | 'crisis' | 'basic-fallback';
  latency: number;
  model: string;
  patterns: string[];
}

interface ResponsePattern {
  keywords: string[];
  responses: string[];
  confidence: number;
  category: string;
}

export class SmartFallbackLLMService {
  private patterns: ResponsePattern[] = [];
  private cache = new Map<string, { message: string; timestamp: number; confidence: number }>();
  private cacheExpiryMinutes = 30;

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    this.patterns = [
      // Meal-related patterns
      {
        keywords: ['meal', 'eat', 'food', 'breakfast', 'lunch', 'dinner', 'snack', 'hungry', 'full', 'appetite'],
        responses: [
          "I hear that meal times can be challenging. Remember that every meal is a step toward healing, no matter how small it feels. What's making this meal particularly difficult for you right now?",
          "Meal times can bring up so many emotions. It's completely normal to feel this way. What would it feel like to approach this meal with a little more self-compassion?",
          "I understand that eating can feel overwhelming. Your body deserves nourishment, and you deserve to eat. What's coming up for you around this meal?",
          "Every time you eat, you're taking care of yourself. That's something to be proud of. What might help you feel a little more supported during this meal?"
        ],
        confidence: 0.8,
        category: 'meal'
      },

      // Body image patterns
      {
        keywords: ['body', 'weight', 'look', 'mirror', 'fat', 'skinny', 'ugly', 'beautiful', 'appearance', 'clothes', 'size'],
        responses: [
          "I understand that body image can be really difficult. You are so much more than how you look. What would it feel like to offer yourself the same compassion you give others?",
          "Body image struggles are so common in recovery. Your worth isn't determined by your appearance. What might help you see yourself with more kindness today?",
          "I hear how much this is affecting you. You deserve to feel comfortable in your body. What would it feel like to focus on what your body can do rather than how it looks?",
          "Body image can be such a challenging part of recovery. Remember that healing takes time, and it's okay to have difficult days. What's one thing you appreciate about yourself beyond appearance?"
        ],
        confidence: 0.8,
        category: 'body-image'
      },

      // Anxiety and stress patterns
      {
        keywords: ['anxious', 'worried', 'stress', 'panic', 'nervous', 'scared', 'fear', 'overwhelmed', 'tense', 'jittery'],
        responses: [
          "Anxiety can feel overwhelming. It's completely normal to feel this way. What might help you feel a little more grounded right now?",
          "I hear how anxious you're feeling. Anxiety is a natural response, and it will pass. What would feel most supportive to you in this moment?",
          "It sounds like you're dealing with a lot of anxiety. That's really hard. What might help you feel a little more calm or centered?",
          "Anxiety can be so challenging. Remember that this feeling is temporary. What would it feel like to take a few deep breaths together?"
        ],
        confidence: 0.7,
        category: 'anxiety'
      },

      // Recovery and healing patterns
      {
        keywords: ['recovery', 'heal', 'better', 'progress', 'improve', 'journey', 'path', 'goal', 'hope', 'future'],
        responses: [
          "Recovery is a journey, and every step you take matters. Even the small victories are worth celebrating. What's one thing you're proud of today, no matter how small?",
          "I hear how much you want to heal. Recovery isn't linear, and that's okay. What would it feel like to acknowledge how far you've already come?",
          "Your recovery journey is unique to you. There's no timeline or perfect way to heal. What feels most important to you right now in your recovery?",
          "Recovery takes courage, and you're showing that courage every day. What would help you feel more supported in your healing journey?"
        ],
        confidence: 0.8,
        category: 'recovery'
      },

      // Relationships and support patterns
      {
        keywords: ['friend', 'family', 'relationship', 'support', 'alone', 'lonely', 'people', 'social', 'connection', 'love'],
        responses: [
          "Relationships can be complicated, especially during recovery. It's okay to need support. What would it feel like to reach out to someone you trust?",
          "I hear how important relationships are to you. Connection can be such a powerful part of healing. What kind of support feels most helpful right now?",
          "It sounds like you're thinking about your relationships. Healthy connections can support your recovery. What would it feel like to be honest about what you need?",
          "Relationships and recovery can be challenging to balance. You deserve to be surrounded by people who support your healing. What feels most important to you in your relationships?"
        ],
        confidence: 0.7,
        category: 'relationships'
      },

      // Self-compassion patterns
      {
        keywords: ['hate', 'disgust', 'shame', 'guilt', 'worthless', 'failure', 'disappointment', 'judge', 'criticize', 'blame'],
        responses: [
          "I hear how much you're struggling with self-judgment. You deserve kindness, especially from yourself. What would it feel like to offer yourself the same compassion you'd give a friend?",
          "Self-criticism can be so painful. You're doing the best you can, and that's enough. What might help you be a little gentler with yourself today?",
          "I understand how hard it is to feel this way about yourself. You are worthy of love and care, exactly as you are. What would it feel like to treat yourself with more kindness?",
          "Self-judgment can be such a challenging part of recovery. Remember that healing takes time and patience. What would help you feel more accepting of yourself?"
        ],
        confidence: 0.8,
        category: 'self-compassion'
      },

      // Triggers and coping patterns
      {
        keywords: ['trigger', 'urge', 'temptation', 'cope', 'manage', 'handle', 'deal', 'resist', 'control', 'avoid'],
        responses: [
          "Triggers can feel overwhelming, but you have more strength than you know. What coping strategies have worked for you in the past?",
          "I hear how challenging this trigger is for you. It's okay to feel this way. What might help you ride out this urge without acting on it?",
          "Triggers are a normal part of recovery. You're not alone in this. What would feel most supportive to you right now?",
          "I understand how difficult this trigger is. Remember that urges are temporary and will pass. What might help you stay grounded in this moment?"
        ],
        confidence: 0.7,
        category: 'triggers'
      },

      // General support patterns
      {
        keywords: ['help', 'support', 'need', 'want', 'feel', 'think', 'wonder', 'question', 'confused', 'lost'],
        responses: [
          "I hear you, and I'm here to listen. What would be most helpful for you right now?",
          "Thank you for sharing that with me. How can I best support you in this moment?",
          "I want to make sure I'm giving you my full attention. Could you tell me more about what's on your mind?",
          "I'm here to listen and support you. What's coming up for you right now?",
          "I hear how much you're going through. You don't have to face this alone. What would feel most supportive?"
        ],
        confidence: 0.6,
        category: 'general'
      }
    ];
  }

  async sendMessage(messages: ChatMessage[]): Promise<SmartFallbackResponse> {
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
          model: 'smart-fallback',
          patterns: ['crisis']
        };
      }

      // Check cache first
      const cached = this.getCachedResponse(messages);
      if (cached) {
        return {
          message: cached.message,
          isCrisis: false,
          confidence: cached.confidence,
          source: 'smart-fallback',
          latency: Date.now() - startTime,
          model: 'smart-fallback',
          patterns: ['cached']
        };
      }

      // Generate smart response based on patterns
      const response = this.generateSmartResponse(lastMessage.content);
      
      // Cache the response
      this.cacheResponse(messages, response.message, response.confidence);

      return {
        message: response.message,
        isCrisis: false,
        confidence: response.confidence,
        source: 'smart-fallback',
        latency: Date.now() - startTime,
        model: 'smart-fallback',
        patterns: response.patterns
      };

    } catch (error) {
      console.error('Smart Fallback LLM Error:', error);
      
      return {
        message: this.getBasicFallbackResponse(),
        isCrisis: false,
        confidence: 0.5,
        source: 'basic-fallback',
        latency: Date.now() - startTime,
        model: 'smart-fallback',
        patterns: ['error']
      };
    }
  }

  private generateSmartResponse(userMessage: string): { message: string; confidence: number; patterns: string[] } {
    const lowerMessage = userMessage.toLowerCase();
    const matchedPatterns: (ResponsePattern & { matchCount: number })[] = [];
    
    // Find all matching patterns
    for (const pattern of this.patterns) {
      const matchCount = pattern.keywords.filter(keyword => 
        lowerMessage.includes(keyword)
      ).length;
      
      if (matchCount > 0) {
        matchedPatterns.push({
          ...pattern,
          matchCount
        });
      }
    }

    // Sort by match count and confidence
    matchedPatterns.sort((a, b) => {
      if (a.matchCount !== b.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.confidence - a.confidence;
    });

    if (matchedPatterns.length > 0) {
      const bestPattern = matchedPatterns[0];
      const response = bestPattern.responses[
        Math.floor(Math.random() * bestPattern.responses.length)
      ];
      
      return {
        message: response,
        confidence: bestPattern.confidence,
        patterns: [bestPattern.category]
      };
    }

    // No specific pattern matched, use general support
    const generalPattern = this.patterns.find(p => p.category === 'general');
    const response = generalPattern?.responses[
      Math.floor(Math.random() * generalPattern.responses.length)
    ] || this.getBasicFallbackResponse();

    return {
      message: response,
      confidence: 0.6,
      patterns: ['general']
    };
  }

  private getCachedResponse(messages: ChatMessage[]): { message: string; confidence: number } | null {
    const key = this.generateCacheKey(messages);
    const cached = this.cache.get(key);
    
    if (!cached) return null;

    const now = Date.now();
    const expiryTime = cached.timestamp + (this.cacheExpiryMinutes * 60 * 1000);
    
    if (now > expiryTime) {
      this.cache.delete(key);
      return null;
    }

    return { message: cached.message, confidence: cached.confidence };
  }

  private cacheResponse(messages: ChatMessage[], response: string, confidence: number): void {
    const key = this.generateCacheKey(messages);
    this.cache.set(key, {
      message: response,
      timestamp: Date.now(),
      confidence
    });
  }

  private generateCacheKey(messages: ChatMessage[]): string {
    const conversation = messages.map(msg => `${msg.role}:${msg.content}`).join('|');
    return btoa(conversation).slice(0, 50);
  }

  private getBasicFallbackResponse(): string {
    const fallbackResponses = [
      "I'm here to listen and support you. What's coming up for you right now?",
      "I hear you, and I'm here to listen. What would be most helpful for you right now?",
      "Thank you for sharing that with me. How can I best support you in this moment?",
      "I want to make sure I'm giving you my full attention. Could you tell me more about what's on your mind?",
      "I'm here to listen and support you. What's coming up for you right now?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  // Health and monitoring methods
  getHealthStatus(): {
    isHealthy: boolean;
    cacheSize: number;
    patternCount: number;
    modelName: string;
  } {
    return {
      isHealthy: true,
      cacheSize: this.cache.size,
      patternCount: this.patterns.length,
      modelName: 'smart-fallback'
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
      console.error('Smart Fallback LLM test failed:', error);
      return false;
    }
  }

  // Add new patterns dynamically
  addPattern(pattern: ResponsePattern): void {
    this.patterns.push(pattern);
  }

  // Get pattern statistics
  getPatternStats(): { category: string; count: number }[] {
    const stats = new Map<string, number>();
    
    for (const pattern of this.patterns) {
      stats.set(pattern.category, (stats.get(pattern.category) || 0) + 1);
    }
    
    return Array.from(stats.entries()).map(([category, count]) => ({
      category,
      count
    }));
  }
}

// Create singleton instance
export const smartFallbackLLMService = new SmartFallbackLLMService(); 