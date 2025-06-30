import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, PromptOption } from '../core/types/chat.types';
import { createLLMService, defaultLLMConfig } from '../services/chat/llm.service';

interface ChatContextType {
  messages: ChatMessage[];
  prompts: PromptOption[];
  sendMessage: (content: string) => Promise<void>;
  selectPrompt: (promptId: string) => Promise<void>;
  loading: boolean;
  endSession: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

const INITIAL_PROMPT = "What's one thing on your mind today?";

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompts, setPrompts] = useState<PromptOption[]>([]);
  const [hasUserResponded, setHasUserResponded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize LLM service
  const llmService = createLLMService(defaultLLMConfig);

  // On mount: add initial Stone message and create session
  useEffect(() => {
    console.log('[CHAT DEBUG] ChatProvider initializing...');
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    
    setMessages([
      {
        id: uuidv4(),
        content: INITIAL_PROMPT,
        isUser: false,
        timestamp: new Date(),
        sessionId: newSessionId,
      },
    ]);
    setPrompts([]);
    setHasUserResponded(false);
    setLoading(false);
    console.log('[CHAT DEBUG] ChatProvider initialized with initial message');
  }, []);

  // Generate follow-up prompts using LLM
  const generatePrompts = async (messages: ChatMessage[]): Promise<PromptOption[]> => {
    console.log('[CHAT DEBUG] Generating prompts for messages:', messages.length);
    try {
      const llmPrompts = await llmService.generateFollowUpPrompts(messages);
      console.log('[CHAT DEBUG] LLM generated prompts:', llmPrompts);
      
      // Convert LLM prompts to PromptOption format
      const promptOptions: PromptOption[] = llmPrompts.map((prompt, index) => ({
        id: uuidv4(),
        text: prompt,
        selected: false,
      }));

      // Add "End reflection" option
      promptOptions.push({
        id: uuidv4(),
        text: 'End reflection',
        selected: false,
      });

      console.log('[CHAT DEBUG] Final prompt options:', promptOptions);
      return promptOptions;
    } catch (error) {
      console.error('[CHAT ERROR] Error generating prompts:', error);
      // Fallback prompts
      return [
        { id: uuidv4(), text: 'How does that make you feel?', selected: false },
        { id: uuidv4(), text: 'What do you wish could be different?', selected: false },
        { id: uuidv4(), text: 'Is there anything you want to do about it?', selected: false },
        { id: uuidv4(), text: 'End reflection', selected: false },
      ];
    }
  };

  // Send user message
  const sendMessage = async (content: string) => {
    console.log('[CHAT DEBUG] sendMessage called with:', content);
    if (!content.trim()) return;
    
    const userMsg: ChatMessage = {
      id: uuidv4(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
      sessionId,
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    console.log('[CHAT DEBUG] User message added, loading prompts...');
    
    try {
      if (!hasUserResponded) {
        setHasUserResponded(true);
        const llmPrompts = await generatePrompts(newMessages);
        setPrompts(llmPrompts);
      } else {
        // After every user reply (except first), fetch new prompts
        const llmPrompts = await generatePrompts(newMessages);
        setPrompts(llmPrompts);
      }
    } catch (error) {
      console.error('[CHAT ERROR] Error in sendMessage:', error);
      // Set fallback prompts on error
      setPrompts([
        { id: uuidv4(), text: 'How does that make you feel?', selected: false },
        { id: uuidv4(), text: 'What do you wish could be different?', selected: false },
        { id: uuidv4(), text: 'Is there anything you want to do about it?', selected: false },
        { id: uuidv4(), text: 'End reflection', selected: false },
      ]);
    } finally {
      setLoading(false);
      console.log('[CHAT DEBUG] sendMessage completed');
    }
  };

  // Select a prompt
  const selectPrompt = async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    // Handle "End reflection"
    if (prompt.text === 'End reflection') {
      endSession();
      return;
    }

    const stoneMsg: ChatMessage = {
      id: uuidv4(),
      content: prompt.text,
      isUser: false,
      timestamp: new Date(),
      sessionId,
    };
    
    setMessages([...messages, stoneMsg]);
    setPrompts([]);
    setLoading(false);
  };

  // End session: reset everything
  const endSession = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    
    setMessages([
      {
        id: uuidv4(),
        content: INITIAL_PROMPT,
        isUser: false,
        timestamp: new Date(),
        sessionId: newSessionId,
      },
    ]);
    setPrompts([]);
    setHasUserResponded(false);
    setLoading(false);
  };

  return (
    <ChatContext.Provider value={{ messages, prompts, sendMessage, selectPrompt, loading, endSession }}>
      {children}
    </ChatContext.Provider>
  );
}; 