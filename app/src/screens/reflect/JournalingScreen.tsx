import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const mockLLMReprompt = (userInput: string) => {
  // Placeholder for LLM reprompt logic
  return `Tell me more about: "${userInput.slice(0, 30)}..."`;
};

const JournalingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { module, submodule } = route.params;

  const [messages, setMessages] = useState([
    { role: 'llm', text: submodule.prompt }
  ]);
  const [input, setInput] = useState('');
  const [canEnd, setCanEnd] = useState(false); // For semantic richness

  const handleSubmit = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', text: input }];
    // Mock: after 2+ user messages, allow ending
    if (newMessages.filter(m => m.role === 'user').length >= 2) setCanEnd(true);
    // Mock LLM reprompt
    const reprompt = mockLLMReprompt(input);
    setMessages([...newMessages, { role: 'llm', text: reprompt }]);
    setInput('');
  };

  const handlePause = () => {
    navigation.goBack();
  };

  const handleEnd = () => {
    // Mark submodule as complete, then go back
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePause} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>Pause</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{submodule.title}</Text>
        <TouchableOpacity onPress={handleEnd} style={[styles.headerBtn, !canEnd && { opacity: 0.4 }]} disabled={!canEnd}>
          <Text style={styles.headerBtnText}>End</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.messages} contentContainerStyle={{ padding: 20 }}>
        {messages.map((msg, idx) => (
          <View key={idx} style={[styles.bubble, msg.role === 'llm' ? styles.llmBubble : styles.userBubble]}>
            <Text style={styles.bubbleText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your reflection..."
            multiline
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerBtn: {
    padding: 8,
  },
  headerBtnText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  messages: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bubble: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  llmBubble: {
    backgroundColor: '#f2f3f7',
  },
  userBubble: {
    backgroundColor: '#e6f7ff',
  },
  bubbleText: {
    fontSize: 16,
    color: '#222',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 16,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    color: '#222',
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default JournalingScreen; 