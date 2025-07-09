import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TypewriterText from './TypewriterText';
import { ChatMessage } from '../../core/types/chat.types';

interface ChatBubbleProps {
  message: ChatMessage;
  showTypewriter?: boolean;
  onTypewriterComplete?: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  showTypewriter = false,
  onTypewriterComplete,
}) => {
  const isUser = message.isUser;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {showTypewriter && !isUser ? (
          <TypewriterText
            text={message.content}
            onComplete={onTypewriterComplete}
            style={[styles.text, isUser ? styles.userText : styles.aiText]}
          />
        ) : (
          <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
            {message.content}
          </Text>
        )}
      </View>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#3498db',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#2c3e50',
  },
  timestamp: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ChatBubble; 