import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';
import { generateResponse } from '../lib/llm';
import { SYSTEM_PROMPTS, getRandomPrompt, buildPrompt, buildFollowUpPrompt } from '../prompts/prompts';

interface ChatMessage {
  id: string;
  type: 'prompt' | 'user' | 'followup' | 'user-followup';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  followUpOptions?: string[];
  selectedFollowUp?: number;
}

const { width, height } = Dimensions.get('window');

export default function ReflectScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'supportive'>('happy');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reflections, setReflections] = useState<any[]>([]);
  const [canType, setCanType] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const typingRef = useRef(false);

  // Initialize with first prompt
  useEffect(() => {
    const initialPrompt = getRandomPrompt();
    const firstMessage: ChatMessage = {
      id: '1',
      type: 'prompt',
      content: initialPrompt.text,
      timestamp: new Date(),
      isTyping: true
    };
    setMessages([firstMessage]);
    setCurrentPromptId('1');
  }, []);

  // Typewriter effect for new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isTyping && lastMessage.type === 'prompt' && !typingRef.current) {
      console.log('Starting typewriter effect for:', lastMessage.content);
      typingRef.current = true;
      let index = 0;
      const originalContent = lastMessage.content;
      setCanType(false);
      
      const typeInterval = setInterval(() => {
        if (index < originalContent.length) {
          setMessages(prev => {
            const newMessages = prev.map(msg => 
              msg.id === lastMessage.id 
                ? { ...msg, content: originalContent.substring(0, index + 1) }
                : msg
            );
            return newMessages;
          });
          index++;
        } else {
          console.log('Typewriter effect completed');
          clearInterval(typeInterval);
          typingRef.current = false;
          
          // Ensure the final message is set correctly
          setMessages(prev => 
            prev.map(msg => 
              msg.id === lastMessage.id 
                ? { ...msg, isTyping: false, content: originalContent }
                : msg
            )
          );
          
          setCanType(true);
          setCurrentPromptId(lastMessage.id);
          
          // Focus the input after typing is complete
          setTimeout(() => {
            inputRef.current?.focus();
          }, 500);
        }
      }, 30);

      // Fallback timeout to ensure completion
      const fallbackTimeout = setTimeout(() => {
        if (typingRef.current) {
          console.log('Typewriter fallback triggered');
          clearInterval(typeInterval);
          typingRef.current = false;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === lastMessage.id 
                ? { ...msg, isTyping: false, content: originalContent }
                : msg
            )
          );
          setCanType(true);
          setCurrentPromptId(lastMessage.id);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 500);
        }
      }, 10000); // 10 second fallback

      return () => {
        clearInterval(typeInterval);
        clearTimeout(fallbackTimeout);
        typingRef.current = false;
      };
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages are added or input changes
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, currentInput]);

  const generateFollowUps = async (userResponse: string) => {
    try {
      setIsLoading(true);
      setMascotMood('thinking');

      const prompt = buildFollowUpPrompt(userResponse);
      const result = await generateResponse(prompt);
      
      const followUpQuestions = result
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && line.length < 200)
        .slice(0, 3);

      // Add follow-up options message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'followup',
        content: 'Here are some deeper questions to explore:',
        timestamp: new Date(),
        followUpOptions: followUpQuestions
      }]);

    } catch (error) {
      console.error('Failed to generate follow-ups:', error);
      Alert.alert('Error', 'Unable to generate follow-up questions');
    } finally {
      setIsLoading(false);
      setMascotMood('supportive');
    }
  };

  const handleSubmit = async () => {
    if (!currentInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setCanType(false);

    // Generate follow-ups
    await generateFollowUps(currentInput);

    // Save to reflections
    const newReflection = {
      id: Date.now().toString(),
      prompt: messages[0]?.content || '',
      response: currentInput,
      timestamp: new Date(),
    };
    setReflections(prev => [newReflection, ...prev]);
  };

  const handleFollowUpSelection = (messageId: string, optionIndex: number) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, selectedFollowUp: optionIndex }
          : msg
      )
    );
  };

  const handleFollowUpResponse = async () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.type !== 'followup' || lastMessage.selectedFollowUp === undefined) return;

    const selectedQuestion = lastMessage.followUpOptions![lastMessage.selectedFollowUp];
    
    // Add the selected question as a user message
    const followUpQuestionMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user-followup',
      content: selectedQuestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, followUpQuestionMessage]);

    // Generate new prompt for next reflection
    const newPrompt = getRandomPrompt();
    const newPromptMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'prompt',
      content: newPrompt.text,
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, newPromptMessage]);
  };

  // Get the current active prompt message
  const getCurrentPromptMessage = () => {
    return messages.find(msg => msg.id === currentPromptId && msg.type === 'prompt');
  };

  const renderMessage = (message: ChatMessage) => {
    switch (message.type) {
      case 'user':
        return (
          <View key={message.id} style={styles.messageContainer}>
            <View style={styles.userContainer}>
              <Text style={styles.userText}>{message.content}</Text>
            </View>
          </View>
        );

      case 'followup':
        return (
          <View key={message.id} style={styles.messageContainer}>
            <View style={styles.stoneContainer}>
              <Mascot mood={mascotMood} size={80} />
            </View>
            <View style={styles.followUpContainer}>
              <Text style={styles.followUpTitle}>{message.content}</Text>
              {message.followUpOptions?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.followUpOption,
                    message.selectedFollowUp === index && styles.followUpOptionSelected
                  ]}
                  onPress={() => handleFollowUpSelection(message.id, index)}
                >
                  <Text style={[
                    styles.followUpOptionText,
                    message.selectedFollowUp === index && styles.followUpOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
              {message.selectedFollowUp !== undefined && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleFollowUpResponse}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case 'user-followup':
        return (
          <View key={message.id} style={styles.messageContainer}>
            <View style={styles.userContainer}>
              <Text style={styles.userText}>{message.content}</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderCalendarModal = () => (
    <Modal
      visible={showCalendar}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCalendar(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calendarModal}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Reflection History</Text>
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.calendarContent}>
            {reflections.length === 0 ? (
              <Text style={styles.noReflectionsText}>No reflections yet</Text>
            ) : (
              reflections.map((reflection) => (
                <TouchableOpacity
                  key={reflection.id}
                  style={styles.calendarItem}
                  onPress={() => {
                    setSelectedDate(reflection.timestamp);
                    setShowCalendar(false);
                  }}
                >
                  <Text style={styles.calendarDate}>
                    {reflection.timestamp.toLocaleDateString()}
                  </Text>
                  <Text style={styles.calendarPreview} numberOfLines={2}>
                    {reflection.response}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const currentPrompt = getCurrentPromptMessage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Calendar Button */}
      <TouchableOpacity 
        style={styles.calendarButton}
        onPress={() => setShowCalendar(true)}
      >
        <Ionicons name="calendar" size={24} color="#6366f1" />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Previous messages */}
          {messages.filter(msg => msg.type !== 'prompt' || msg.id !== currentPromptId).map(renderMessage)}
          
          {/* Current prompt and input area */}
          {currentPrompt && (
            <View style={styles.messageContainer}>
              <View style={styles.stoneContainer}>
                <Mascot mood={mascotMood} size={80} />
              </View>
              <View style={styles.seamlessContainer}>
                <Text style={styles.promptText}>
                  {currentPrompt.content}
                  {currentPrompt.isTyping && <Text style={styles.cursor}>|</Text>}
                </Text>
                {!currentPrompt.isTyping && canType && (
                  <TextInput
                    ref={inputRef}
                    style={styles.seamlessInput}
                    value={currentInput}
                    onChangeText={setCurrentInput}
                    placeholder="your response"
                    placeholderTextColor="#6b7280"
                    multiline
                    maxLength={1000}
                    editable={true}
                    autoFocus={true}
                    selectionColor="#6366f1"
                    scrollEnabled={false}
                    textAlignVertical="top"
                    numberOfLines={undefined}
                    onContentSizeChange={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 50);
                    }}
                  />
                )}
              </View>
            </View>
          )}
          
          {isLoading && (
            <View style={styles.messageContainer}>
              <View style={styles.stoneContainer}>
                <Mascot mood="thinking" size={80} />
              </View>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#6366f1" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        {canType && currentInput.trim() && (
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {renderCalendarModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  calendarButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  chatContent: {
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 40,
    width: '100%',
  },
  stoneContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  seamlessContainer: {
    width: '100%',
    minHeight: 100,
  },
  promptText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#e5e7eb',
    textAlign: 'left',
    fontFamily: 'monospace',
    marginBottom: 0,
  },
  cursor: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  seamlessInput: {
    width: '100%',
    fontSize: 18,
    lineHeight: 26,
    color: '#6366f1',
    fontFamily: 'monospace',
    textAlign: 'left',
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    height: 'auto',
    minHeight: 26,
  },
  userContainer: {
    width: '100%',
    paddingLeft: 20,
  },
  userText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#6366f1',
    textAlign: 'left',
    fontFamily: 'monospace',
  },
  followUpContainer: {
    width: '100%',
  },
  followUpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 16,
    textAlign: 'left',
  },
  followUpOption: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#111827',
  },
  followUpOptionSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  followUpOptionText: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 22,
    textAlign: 'left',
  },
  followUpOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  calendarContent: {
    padding: 20,
  },
  noReflectionsText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 16,
  },
  calendarItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  calendarDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  calendarPreview: {
    fontSize: 14,
    color: '#d1d5db',
  },
}); 