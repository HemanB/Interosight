import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useChat } from '../../hooks/useChat';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import PromptSelector from '../../components/chat/PromptSelector';

const ChatScreen: React.FC = () => {
  const {
    messages,
    prompts,
    loading,
    error,
    crisisDetected,
    sendMessage,
    selectPrompt,
    generatePrompts,
    endSession,
  } = useChat();

  const scrollViewRef = useRef<ScrollView>(null);
  const [showTypewriter, setShowTypewriter] = useState(false);

  useEffect(() => {
    // Generate initial prompts when screen loads
    if (messages.length === 0) {
      generatePrompts();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
    setShowTypewriter(true);
  };

  const handleTypewriterComplete = () => {
    setShowTypewriter(false);
  };

  const handleUsePrompt = (promptText: string) => {
    if (promptText === 'End reflection') {
      Alert.alert(
        'End Session',
        'Are you sure you want to end this reflection session?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'End Session', style: 'destructive', onPress: endSession },
        ]
      );
    } else {
      handleSendMessage(promptText);
    }
  };

  const handleCrisisDetected = () => {
    Alert.alert(
      'Crisis Support Available',
      'I\'ve detected that you might be in crisis. Please know that you\'re not alone and help is available. Would you like to access crisis resources?',
      [
        { text: 'Continue Chat', style: 'cancel' },
        { text: 'Crisis Resources', style: 'default', onPress: () => {
          // TODO: Navigate to crisis screen
          Alert.alert('Crisis Resources', 'Navigate to Crisis Tools screen for immediate support.');
        }},
      ]
    );
  };

  useEffect(() => {
    if (crisisDetected) {
      handleCrisisDetected();
    }
  }, [crisisDetected]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stone of Wisdom</Text>
        <Text style={styles.headerSubtitle}>Your therapeutic companion</Text>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to the Stone of Wisdom</Text>
            <Text style={styles.welcomeText}>
              I'm here to listen and support you on your recovery journey. 
              Share your thoughts, feelings, or experiences, and I'll respond with care and understanding.
            </Text>
            <Text style={styles.welcomeNote}>
              Remember: I'm here to support you, but I'm not a replacement for professional treatment.
            </Text>
          </View>
        ) : (
          messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              showTypewriter={showTypewriter && index === messages.length - 1 && !message.isUser}
              onTypewriterComplete={handleTypewriterComplete}
            />
          ))
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Stone of Wisdom is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Prompt Selector */}
      <PromptSelector
        prompts={prompts}
        onSelectPrompt={selectPrompt}
        onUsePrompt={handleUsePrompt}
      />

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        loading={loading}
        placeholder="Share your thoughts..."
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  welcomeContainer: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  welcomeNote: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default ChatScreen; 