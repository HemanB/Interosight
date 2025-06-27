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
      // Check for crisis detection
      const crisisAssessment = chatService.detectCrisis(content);
      
      setState(prev => ({
        ...prev,
        loading: false,
        crisisDetected: crisisAssessment.isCrisis,
      }));

      // Generate new prompts after user message (no stone response)
      generatePrompts();
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

    // Clear current prompts
    setPrompts([]);

    // Add the prompt as a STONE message (this is what the stone is asking)
    const promptMessage: ChatMessage = {
      id: Date.now().toString(),
      content: selectedPrompt.text,
      isUser: false, // Stone message
      timestamp: new Date(),
      sessionId: state.currentSession || '',
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, promptMessage],
      // Don't set loading here - wait for user response
    }));

    // If it's "End reflection", end the session after adding the message
    if (selectedPrompt.text === 'End reflection') {
      // Add a small delay to show the message before ending
      setTimeout(() => {
        endSession();
      }, 1000);
      return;
    }

    // Don't generate response here - wait for user to respond to the prompt
  };

  const generatePrompts = () => {
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

  const endSession = async () => {
    console.log('End session called');
    
    // Add a confirmation message before ending
    const endMessage: ChatMessage = {
      id: Date.now().toString(),
      content: "Thank you for this reflection session. Your insights are valuable for your recovery journey. Take care of yourself.",
      isUser: false, // Stone message
      timestamp: new Date(),
      sessionId: state.currentSession || '',
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, endMessage],
    }));
    
    // Wait a moment for the user to read the message, then clear
    setTimeout(async () => {
      // Clear everything
      setState({
        messages: [],
        currentSession: null,
        loading: false,
        error: null,
        crisisDetected: false,
      });
      setPrompts([]);
      
      console.log('State cleared, initializing new session');
      
      // Initialize new session
      await initializeSession();
      
      console.log('New session initialized, generating prompts');
      
      // Generate initial prompts for the new session
      generatePrompts();
      
      console.log('End session complete');
    }, 2000);
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