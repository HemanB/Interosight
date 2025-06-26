import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TypewriterText } from '../components/TypewriterText';
import { chatService, ChatPrompt } from '../lib/services/chatService';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export const RPGChatScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentPrompt, setCurrentPrompt] = useState<ChatPrompt | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);
  const [conversationText, setConversationText] = useState('');
  const [newAIResponse, setNewAIResponse] = useState('');
  
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize screen
  useEffect(() => {
    initializeChat();
  }, []);

  // Auto-scroll when conversation text changes
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversationText]);

  const initializeChat = async () => {
    try {
      const prompts = await chatService.getPrompts();
      if (prompts.length > 0) {
        setCurrentPrompt(prompts[0]);
        setConversationText(prompts[0].initialMessage + '\n\n');
        setIsTypewriterComplete(true);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const handleTypewriterComplete = () => {
    setIsTypewriterComplete(true);
    setNewAIResponse('');
    // Add the AI response to the conversation
    setConversationText(prev => prev + '\n\n');
  };

  const handleTextChange = (text: string) => {
    setConversationText(text);
  };

  const handleSubmit = async () => {
    if (!user || !currentPrompt) return;

    try {
      setIsTyping(true);
      
      // Get the current text and find the last user input
      const lines = conversationText.split('\n\n');
      const lastLine = lines[lines.length - 1];
      
      // Remove the last line (user input) and send it
      const conversationWithoutInput = lines.slice(0, -1).join('\n\n');
      const userInput = lastLine;
      
      if (!userInput.trim()) {
        setIsTyping(false);
        return;
      }
      
      // Create session and add message
      const session = await chatService.createSession(user.id, currentPrompt.id);
      await chatService.addMessage(user.id, session.id, userInput.trim(), true);
      
      // Generate AI response
      const aiMessage = await chatService.generateResponse(user.id, session.id, userInput.trim());
      
      // Add user input to the conversation (without typewriter)
      const updatedConversation = conversationWithoutInput + '\n\n' + userInput + '\n\n';
      setConversationText(updatedConversation);
      
      // Show typewriter effect for the new AI response only
      setNewAIResponse(aiMessage.content);
      setIsTypewriterComplete(false);
      
      setIsTyping(false);
    } catch (error) {
      console.error('Error processing message:', error);
      setIsTyping(false);
    }
  };

  // Check if user has typed anything
  const hasUserInput = () => {
    const lines = conversationText.split('\n\n');
    const lastLine = lines[lines.length - 1];
    return lastLine.trim().length > 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.textContainer}>
            {/* Show the conversation history */}
            <Text style={styles.text}>
              {conversationText}
            </Text>
            
            {/* Show typewriter effect for new AI response only */}
            {!isTypewriterComplete && newAIResponse && (
              <TypewriterText
                text={newAIResponse}
                speed={30}
                onComplete={handleTypewriterComplete}
                style={styles.text}
              />
            )}
            
            {/* Show the complete conversation in a TextInput when typewriter is complete */}
            {isTypewriterComplete && (
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={conversationText}
                onChangeText={handleTextChange}
                multiline
                autoFocus
                blurOnSubmit={false}
                editable={true}
                placeholder=""
                placeholderTextColor="transparent"
                selectionColor="#ffffff"
                cursorColor="#ffffff"
                textAlignVertical="top"
              />
            )}
          </View>

          {/* Submit button */}
          {isTypewriterComplete && !isTyping && hasUserInput() && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
              <Text style={styles.submitText}>Send</Text>
            </TouchableOpacity>
          )}

          {/* Loading indicator for AI response */}
          {isTyping && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>...</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  textContainer: {
    flex: 1,
    minHeight: height * 0.6, // Ensure minimum height for mobile
  },
  text: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    textAlign: 'left',
  },
  textInput: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    textAlign: 'left',
    padding: 0,
    margin: 0,
    flex: 1,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'flex-end',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
}); 