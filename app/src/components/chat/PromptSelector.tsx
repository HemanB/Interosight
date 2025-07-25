import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PromptOption } from '../../core/types/chat.types';

interface PromptSelectorProps {
  prompts: PromptOption[];
  onSelectPrompt: (promptId: string) => void;
  onUsePrompt: (promptText: string) => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({
  prompts,
  onSelectPrompt,
  onUsePrompt,
}) => {
  console.log('[PROMPT SELECTOR DEBUG] Rendering with prompts:', prompts.map(p => p.text));
  
  if (prompts.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a prompt to continue:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        {prompts.map((prompt) => (
          <TouchableOpacity
            key={prompt.id}
            style={[styles.promptButton, prompt.selected && styles.promptButtonSelected]}
            onPress={() => onSelectPrompt(prompt.id)}
          >
            <Text style={[styles.promptText, prompt.selected && styles.promptTextSelected]}>
              {prompt.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {prompts.some(p => p.selected) && (
        <TouchableOpacity
          style={styles.usePromptButton}
          onPress={() => {
            const selectedPrompt = prompts.find(p => p.selected);
            if (selectedPrompt) {
              onUsePrompt(selectedPrompt.text);
            }
          }}
        >
          <Text style={styles.usePromptButtonText}>Use Selected Prompt</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  scrollContainer: {
    marginBottom: 12,
  },
  promptButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    minWidth: 150,
    maxWidth: 200,
    flexShrink: 0,
  },
  promptButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  promptText: {
    fontSize: 13,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 18,
  },
  promptTextSelected: {
    color: '#ffffff',
  },
  usePromptButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  usePromptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PromptSelector; 