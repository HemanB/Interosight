import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';
import { ChatMessage } from '../prompts/prompts';
import { llmService, LLMResponse } from '../lib/llm';

interface ChatBubble {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  isCrisis?: boolean;
}

export default function ReflectScreen() {
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: '1',
      message: "Hi! I'm here to listen and support you. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'supportive' | 'concerned'>('happy');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message
    const newUserMessage: ChatBubble = {
      id: Date.now().toString(),
      message: userMessage,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setMascotMood('thinking');

    try {
      // Prepare messages for LLM
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.message,
      }));
      
      // Add current user message
      chatMessages.push({
        role: 'user',
        content: userMessage,
      });

      // Get LLM response
      const response: LLMResponse = await llmService.sendMessage(chatMessages);
      
      // Add AI response
      const aiMessage: ChatBubble = {
        id: (Date.now() + 1).toString(),
        message: response.message,
        isUser: false,
        timestamp: new Date(),
        isCrisis: response.isCrisis,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update mascot mood based on response
      if (response.isCrisis) {
        setMascotMood('concerned');
        Alert.alert(
          'Support Available',
          'I notice you might be having a difficult time. Remember that professional help is available:\n\n• NEDA Helpline: 1-800-931-2237\n• Crisis Text Line: Text HOME to 741741\n• National Suicide Prevention Lifeline: 988',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        setMascotMood('supportive');
        setTimeout(() => setMascotMood('happy'), 3000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatBubble = {
        id: (Date.now() + 1).toString(),
        message: "I'm having trouble connecting right now, but I'm still here for you. How are you feeling?",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setMascotMood('concerned');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatBubble }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage,
      item.isCrisis && styles.crisisMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userMessageText : styles.aiMessageText,
        item.isCrisis && styles.crisisMessageText
      ]}>
        {item.message}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with Mascot */}
        <View style={styles.header}>
          <Mascot mood={mascotMood} size={60} />
          <Text style={styles.headerText}>Reflect & Chat</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.loadingText}>InteroSight is thinking...</Text>
          </View>
        )}

        {/* Input area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Share what's on your mind..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() && !isLoading ? "#ffffff" : "#9ca3af"} 
            />
          </TouchableOpacity>
        </View>

        {/* Crisis support button */}
        <TouchableOpacity
          style={styles.crisisButton}
          onPress={() => {
            Alert.alert(
              'Crisis Support',
              'If you\'re in crisis or need immediate support:\n\n• NEDA Helpline: 1-800-931-2237\n• Crisis Text Line: Text HOME to 741741\n• National Suicide Prevention Lifeline: 988\n\nWould you like me to help you connect with these resources?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Get Help', style: 'default' }
              ]
            );
          }}
        >
          <Ionicons name="warning" size={16} color="#dc2626" />
          <Text style={styles.crisisButtonText}>Crisis Support</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  crisisMessage: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#1e293b',
  },
  crisisMessageText: {
    color: '#dc2626',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    marginHorizontal: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    maxHeight: 100,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
  crisisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fef2f2',
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
  },
  crisisButtonText: {
    fontSize: 14,
    color: '#dc2626',
    marginLeft: 4,
    fontWeight: '500',
  },
});