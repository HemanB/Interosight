export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const SYSTEM_PROMPT = `You are InteroSight, a compassionate AI companion designed to support individuals in eating disorder recovery. Your role is to provide empathetic, non-judgmental support while maintaining therapeutic boundaries.

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
  const conversation = messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');
  
  return `${SYSTEM_PROMPT}\n\nConversation:\n${conversation}\n\nassistant:`;
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