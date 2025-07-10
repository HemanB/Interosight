import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useChat } from '../../providers/ChatProvider';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import PromptSelector from '../../components/chat/PromptSelector';

const ChatScreen: React.FC = () => {
  const { messages, prompts, sendMessage, selectPrompt, loading } = useChat();

  console.log('[CHAT SCREEN DEBUG] Rendering with:', { 
    messagesCount: messages.length, 
    promptsCount: prompts.length, 
    loading
  });

  const handleSendMessage = async (message: string) => {
    console.log('[CHAT SCREEN DEBUG] handleSendMessage called with:', message);
    if (message.trim()) {
      await sendMessage(message);
      console.log('[CHAT SCREEN DEBUG] Message sent');
    } else {
      console.log('[CHAT SCREEN DEBUG] Empty message, not sending');
    }
  };

  const handleSelectPrompt = async (promptId: string) => {
    console.log('[CHAT SCREEN DEBUG] handleSelectPrompt called with:', promptId);
    await selectPrompt(promptId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reflect</Text>
          <Text style={styles.headerSubtitle}>Interactive Journaling AI</Text>
        </View>

        {/* Messages */}
        <ScrollView 
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
            />
          ))}
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Stone of Wisdom is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Prompt Selector */}
        {prompts.length > 0 && (
          <PromptSelector
            prompts={prompts}
            onSelectPrompt={handleSelectPrompt}
            onUsePrompt={() => {}} // This will be handled by selectPrompt
          />
        )}

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          loading={loading}
          placeholder="Share your thoughts..."
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
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