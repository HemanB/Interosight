import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService } from '../services/chat/chat.service';
import { ChatState, ChatMessage, PromptOption } from '../core/types/chat.types';

interface ChatContextType extends ChatState {
  prompts: PromptOption[];
  sendMessage: (content: string) => Promise<void>;
  selectPrompt: (promptId: string) => Promise<void>;
  generatePrompts: () => void;
  endSession: () => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    currentSession: null,
    loading: false,
    error: null,
    crisisDetected: false,
  });

  const [prompts, setPrompts] = useState<PromptOption[]>([]);

  useEffect(() => {
    // Initialize session when component mounts
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const sessionId = await chatService.createSession();
      setState(prev => ({
        ...prev,
        currentSession: sessionId,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
      }));
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
      sessionId: state.currentSession || '',
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      loading: true,
      error: null,
    }));

    try {
      // Send message and get response
      const response = await chatService.sendMessage(content);
      
      // Check for crisis detection
      const crisisAssessment = chatService.detectCrisis(content);
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, response],
        loading: false,
        crisisDetected: crisisAssessment.isCrisis,
      }));

      // Generate follow-up questions as stone messages
      generateFollowUpQuestions();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  const selectPrompt = async (promptId: string) => {
    const selectedPrompt = prompts.find(p => p.id === promptId);
    if (!selectedPrompt) return;

    if (selectedPrompt.text === 'End reflection') {
      endSession();
      return;
    }

    // Add the prompt as a stone message
    const promptMessage: ChatMessage = {
      id: Date.now().toString(),
      content: selectedPrompt.text,
      isUser: false,
      timestamp: new Date(),
      sessionId: state.currentSession || '',
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, promptMessage],
      loading: true,
    }));

    try {
      // Generate a response to the prompt
      const response = await chatService.sendMessage(selectedPrompt.text);
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, response],
        loading: false,
      }));

      // Generate new follow-up questions
      generateFollowUpQuestions();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  const generateFollowUpQuestions = () => {
    const mockPrompts: PromptOption[] = [
      {
        id: '1',
        text: 'How are you feeling about your recovery progress?',
        selected: false,
      },
      {
        id: '2',
        text: 'What challenges are you facing today?',
        selected: false,
      },
      {
        id: '3',
        text: 'Tell me about a positive moment you experienced.',
        selected: false,
      },
      {
        id: '4',
        text: 'End reflection',
        selected: false,
      },
    ];
    setPrompts(mockPrompts);
  };

  const generatePrompts = () => {
    generateFollowUpQuestions();
  };

  const endSession = () => {
    setState(prev => ({
      ...prev,
      messages: [],
      currentSession: null,
      crisisDetected: false,
    }));
    setPrompts([]);
    initializeSession();
  };

  const clearMessages = () => {
    setState(prev => ({
      ...prev,
      messages: [],
    }));
  };

  const value: ChatContextType = {
    ...state,
    prompts,
    sendMessage,
    selectPrompt,
    generatePrompts,
    endSession,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 