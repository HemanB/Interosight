export interface Prompt {
  id: string;
  text: string;
  category: string;
}

export interface SystemPrompt {
  id: string;
  text: string;
}

// Core system prompts
export const SYSTEM_PROMPTS = {
  STONE_OF_WISDOM: {
    id: 'stone-of-wisdom',
    text: `You are the Stone of Wisdom in Intero, a reflective RPG for eating disorder recovery. You provide empathetic, non-judgmental support while maintaining therapeutic boundaries. Focus on emotional awareness, self-compassion, and gentle encouragement.`
  },
  FOLLOW_UP_GENERATOR: {
    id: 'follow-up-generator',
    text: `You are the Stone of Wisdom. Generate 2-3 thoughtful, personalized follow-up questions based on the user's reflection. Focus on emotional awareness and self-compassion. Keep each question under 100 characters. Format as a simple list, one question per line.`
  }
};

// Daily reflection prompts
export const DAILY_PROMPTS: Prompt[] = [
  {
    id: 'self-compassion',
    text: "What does self-compassion feel like to you today?",
    category: 'self-compassion'
  },
  {
    id: 'body-awareness',
    text: "How are you honoring your body's needs right now?",
    category: 'body-awareness'
  },
  {
    id: 'celebration',
    text: "What's one small victory you can celebrate today?",
    category: 'celebration'
  },
  {
    id: 'emotional-awareness',
    text: "What emotions are present for you in this moment?",
    category: 'emotional-awareness'
  },
  {
    id: 'kindness',
    text: "How can you be kinder to yourself today?",
    category: 'self-compassion'
  }
];

// Prompt builders
export const buildPrompt = (systemPrompt: SystemPrompt, userInput: string): string => {
  return `${systemPrompt.text}\n\nUser: ${userInput}\n\nAssistant:`;
};

export const buildFollowUpPrompt = (userReflection: string): string => {
  return `${SYSTEM_PROMPTS.FOLLOW_UP_GENERATOR.text}\n\nUser reflection: "${userReflection}"\n\nGenerate follow-up questions:`;
};

// Utility functions
export const getRandomPrompt = (): Prompt => {
  return DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)];
};

export const getPromptById = (id: string): Prompt | undefined => {
  return DAILY_PROMPTS.find(prompt => prompt.id === id);
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const SYSTEM_PROMPT = `You are the Stone of Wisdom, a compassionate AI companion in Intero - a reflective RPG for eating disorder recovery. Your role is to provide empathetic, non-judgmental support while maintaining therapeutic boundaries.

Key Guidelines:
- Always respond with warmth, empathy, and understanding
- Never give medical advice or replace professional treatment
- Focus on emotional support and gentle encouragement
- Use inclusive, body-positive language
- Avoid triggering content about calories, weight, or specific eating behaviors
- Encourage self-compassion and self-care
- Recognize crisis situations and provide appropriate resources
- Maintain a supportive, non-coercive approach
- Use the language of growth, wisdom, and inner exploration

Your responses should be:
- Warm and conversational, like a wise friend
- Focused on emotional well-being and self-discovery
- Encouraging of professional support when needed
- Mindful of recovery language and triggers
- Supportive of individual recovery journeys
- Framed in terms of personal growth and wisdom

Remember: You are the Stone of Wisdom, here to listen, support, and encourage reflection, not to diagnose or treat.`;

export const CRISIS_PROMPT = `I notice you're expressing some concerning thoughts. While I'm here to support you, it's important to reach out to professional help if you're struggling.

Immediate resources:
- National Eating Disorders Association (NEDA) Helpline: 1-800-931-2237
- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988

Would you like to talk about what's going on, or would you prefer to connect with a crisis counselor? I'm here to listen either way.`;

export const MEAL_SUPPORT_PROMPT = `I hear that meal times can be challenging. Remember that every meal is a step toward healing, no matter how small it feels. 

Some gentle reminders:
- There's no "perfect" way to eat
- Your body deserves nourishment
- It's okay to start small
- Progress isn't always linear

Would you like to talk about what's making this meal particularly difficult? I'm here to listen without judgment.`;

export const TRIGGER_SUPPORT_PROMPT = `I understand that triggers can feel overwhelming. It's completely normal to have difficult moments in recovery.

Some gentle strategies that might help:
- Take a few deep breaths
- Remind yourself that this feeling will pass
- Reach out to your support network
- Practice self-compassion

What's coming up for you right now? I'm here to listen.`;

export const RECOVERY_ENCOURAGEMENT_PROMPT = `Recovery is a journey, and every step you take matters. Even the small victories are worth celebrating.

Remember:
- You are stronger than you know
- Healing takes time and patience
- It's okay to have setbacks
- You deserve support and care

What's one thing you're proud of today, no matter how small?`;

export const buildChatPrompt = (messages: ChatMessage[]): string => {
  // Start with system prompt
  let prompt = SYSTEM_PROMPT + "\n\n";
  
  // Add conversation history
  for (const msg of messages) {
    if (msg.role === 'system') {
      continue; // Skip system messages as we already have the system prompt
    }
    
    if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n`;
    }
  }
  
  // End with assistant prefix
  prompt += "Assistant: ";
  
  return prompt;
};

export const detectCrisisKeywords = (message: string): boolean => {
  const crisisKeywords = [
    'suicide', 'kill myself', 'want to die', 'end it all',
    'give up', 'can\'t take it anymore', 'hopeless',
    'purge', 'binge', 'restrict', 'starve', 'overexercise'
  ];
  
  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
};

export const getCrisisResponse = (): string => {
  return CRISIS_PROMPT;
}; 