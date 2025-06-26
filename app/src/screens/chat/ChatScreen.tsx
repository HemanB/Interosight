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
import TypewriterText from '../../components/chat/TypewriterText';

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
  const inputRef = useRef<TextInput>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);

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

  useEffect(() => {
    // Show prompts when not loading and we have prompts
    if (!loading && prompts.length > 0 && messages.length > 0) {
      setShowPrompts(true);
    } else {
      setShowPrompts(false);
    }
  }, [loading, prompts, messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    await sendMessage(content.trim());
    setCurrentInput('');
    setShowPrompts(false);
  };

  const handlePromptSelect = async (promptText: string) => {
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
      // Find the prompt by text and select it
      const prompt = prompts.find(p => p.text === promptText);
      if (prompt) {
        await selectPrompt(prompt.id);
        setShowPrompts(false);
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

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSendMessage(currentInput);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stone of Wisdom Header */}
      <View style={styles.header}>
        <Text style={styles.stoneTitle}>💎 Stone of Wisdom</Text>
        <Text style={styles.stoneSubtitle}>Your therapeutic companion</Text>
        {loading && (
          <View style={styles.glowContainer}>
            <Text style={styles.glowText}>✨ Glowing...</Text>
          </View>
        )}
      </View>

      {/* Main Output Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.outputContainer}
        contentContainerStyle={styles.outputContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to the Stone of Wisdom</Text>
            <Text style={styles.welcomeText}>
              I am the Stone of Wisdom, here to guide you on your recovery journey.
              Share your thoughts, feelings, or experiences, and I will respond with care and understanding.
            </Text>
            <Text style={styles.welcomeNote}>
              Remember: I am here to support you, but I am not a replacement for professional treatment.
            </Text>
          </View>
        ) : (
          messages.map((message, index) => (
            <View key={message.id} style={styles.messageContainer}>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userText : styles.stoneText
              ]}>
                {message.content}
              </Text>
            </View>
          ))
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        {/* Follow-up Questions */}
        {showPrompts && prompts.length > 0 && (
          <View style={styles.promptsContainer}>
            <Text style={styles.promptsTitle}>Choose your path:</Text>
            {prompts.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={styles.promptItem}
                onPress={() => handlePromptSelect(prompt.text)}
              >
                <Text style={styles.promptText}>→ {prompt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Direct Input */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.directInput}
          value={currentInput}
          onChangeText={setCurrentInput}
          placeholder="Type your thoughts..."
          placeholderTextColor="#666666"
          multiline
          maxLength={500}
          onKeyPress={handleKeyPress}
          editable={!loading}
          autoFocus={true}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!currentInput.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage(currentInput)}
          disabled={!currentInput.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Enter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 16,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
    alignItems: 'center',
  },
  stoneTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 4,
  },
  stoneSubtitle: {
    fontSize: 14,
    color: '#888888',
  },
  glowContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#00ff00',
    borderRadius: 4,
  },
  glowText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  outputContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  outputContent: {
    padding: 16,
  },
  welcomeContainer: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 16,
  },
  welcomeNote: {
    fontSize: 14,
    color: '#ff6b6b',
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  userText: {
    color: '#87ceeb', // Light blue for user
  },
  stoneText: {
    color: '#ffffff', // White for stone
  },
  loadingContainer: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#888888',
    fontFamily: 'monospace',
  },
  promptsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
  },
  promptsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 12,
  },
  promptItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: '#404040',
    borderRadius: 4,
  },
  promptText: {
    fontSize: 14,
    color: '#ffffff',
  },
  inputContainer: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#404040',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  directInput: {
    flex: 1,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#87ceeb',
    fontFamily: 'monospace',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#00ff00',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#404040',
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatScreen; 