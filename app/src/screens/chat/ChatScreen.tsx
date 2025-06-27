import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useChat } from '../../hooks/useChat';

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
  const [currentInput, setCurrentInput] = useState('');

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
    if (!content.trim()) return;
    await sendMessage(content.trim());
    setCurrentInput('');
  };

  const handlePromptSelect = async (promptText: string) => {
    if (promptText === 'End reflection') {
      Alert.alert(
        'End Session',
        'Are you sure you want to end this reflection session?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'End Session', style: 'destructive', onPress: async () => {
            await endSession();
          }},
        ]
      );
    } else {
      const prompt = prompts.find(p => p.text === promptText);
      if (prompt) {
        await selectPrompt(prompt.id);
      }
    }
  };

  const handleCrisisDetected = () => {
    Alert.alert(
      'Crisis Support Available',
      'I\'ve detected that you might be in crisis. Please know that you\'re not alone and help is available. Would you like to access crisis resources?',
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'Crisis Resources', style: 'default', onPress: () => {
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

  // Only show prompts when not loading and we have prompts
  const shouldShowPrompts = !loading && prompts.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Stone of Wisdom</Text>
        {loading && <Text style={styles.loading}>Thinking...</Text>}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.welcome}>
            <Text style={styles.welcomeText}>
              Welcome! I'm here to support your recovery journey. 
              Share your thoughts or choose a prompt to begin.
            </Text>
          </View>
        ) : (
          messages.map((message, index) => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.stoneMessage
            ]}>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userText : styles.stoneText
              ]}>
                {message.content}
              </Text>
            </View>
          ))
        )}

        {/* Prompts - only show when not loading */}
        {shouldShowPrompts && (
          <View style={styles.promptsContainer}>
            <Text style={styles.promptsTitle}>Choose an option:</Text>
            {prompts.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={styles.promptButton}
                onPress={() => handlePromptSelect(prompt.text)}
              >
                <Text style={styles.promptText}>{prompt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={currentInput}
          onChangeText={setCurrentInput}
          placeholder="Type your message..."
          placeholderTextColor="#666"
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!currentInput.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage(currentInput)}
          disabled={!currentInput.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loading: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  welcome: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  stoneMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  stoneText: {
    color: '#333',
  },
  promptsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  promptsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  promptButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#333',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen; 