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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';
import { ChatMessage } from '../prompts/prompts';
import { llmService, LLMResponse } from '../lib/llm';

interface ReflectionEntry {
  id: string;
  prompt: string;
  response: string;
  followUps?: string[];
  tags: string[];
  timestamp: Date;
  xpEarned: number;
}

interface DailyPrompt {
  id: string;
  prompt: string;
  category: string;
  used: boolean;
}

export default function ReflectScreen() {
  const [currentPrompt, setCurrentPrompt] = useState<DailyPrompt | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [currentFollowUp, setCurrentFollowUp] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [mascotMood, setMascotMood] = useState<'happy' | 'supportive' | 'thinking'>('happy');
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  const dailyPrompts: DailyPrompt[] = [
    {
      id: '1',
      prompt: "What does self-compassion feel like to you today?",
      category: 'self-compassion',
      used: false,
    },
    {
      id: '2',
      prompt: "How are you honoring your body's needs right now?",
      category: 'body-awareness',
      used: false,
    },
    {
      id: '3',
      prompt: "What's one small victory you can celebrate today?",
      category: 'celebration',
      used: false,
    },
    {
      id: '4',
      prompt: "What emotions are present for you in this moment?",
      category: 'emotional-awareness',
      used: false,
    },
    {
      id: '5',
      prompt: "How can you be kinder to yourself today?",
      category: 'self-compassion',
      used: false,
    },
  ];

  useEffect(() => {
    // Get today's prompt
    const today = new Date().toDateString();
    const todayReflection = reflections.find(r => 
      r.timestamp.toDateString() === today
    );
    
    if (!todayReflection) {
      const unusedPrompts = dailyPrompts.filter(p => !p.used);
      if (unusedPrompts.length > 0) {
        const randomPrompt = unusedPrompts[Math.floor(Math.random() * unusedPrompts.length)];
        setCurrentPrompt(randomPrompt);
      }
    }
  }, []);

  const generateFollowUps = async (response: string) => {
    setIsLoading(true);
    setMascotMood('thinking');

    try {
      // This would integrate with your LLM service
      // For now, using placeholder follow-ups
      const mockFollowUps = [
        "What does that tell you about your needs right now?",
        "How might you respond to yourself with more kindness?",
        "What would it feel like to hold this experience with gentleness?"
      ];
      
      setFollowUpQuestions(mockFollowUps);
      setCurrentFollowUp(0);
    } catch (error) {
      console.error('Error generating follow-ups:', error);
    } finally {
      setIsLoading(false);
      setMascotMood('supportive');
    }
  };

  const submitReflection = async () => {
    if (!userResponse.trim() || !currentPrompt) return;

    setIsLoading(true);
    setMascotMood('thinking');

    try {
      // Generate follow-ups
      await generateFollowUps(userResponse);

      // Calculate XP based on response length and emotional richness
      const xpEarned = Math.min(50 + (userResponse.length / 10), 100);

      // Create reflection entry
      const newReflection: ReflectionEntry = {
        id: Date.now().toString(),
        prompt: currentPrompt.prompt,
        response: userResponse,
        tags: [currentPrompt.category],
        timestamp: new Date(),
        xpEarned,
      };

      setReflections(prev => [newReflection, ...prev]);
      
      // Mark prompt as used
      setCurrentPrompt(prev => prev ? { ...prev, used: true } : null);

    } catch (error) {
      console.error('Error submitting reflection:', error);
      Alert.alert('Error', 'Unable to save your reflection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const answerFollowUp = async (followUpIndex: number) => {
    if (currentFollowUp < 0) return;

    const followUpResponse = userResponse; // This would be a separate input
    setCurrentFollowUp(followUpIndex + 1);

    if (followUpIndex + 1 >= followUpQuestions.length) {
      // All follow-ups answered, complete the reflection
      setUserResponse('');
      setFollowUpQuestions([]);
      setCurrentFollowUp(-1);
      setMascotMood('supportive');
    }
  };

  const renderReflectionCard = ({ item }: { item: ReflectionEntry }) => (
    <View style={styles.reflectionCard}>
      <View style={styles.reflectionHeader}>
        <Text style={styles.reflectionDate}>
          {item.timestamp.toLocaleDateString()}
        </Text>
        <View style={styles.xpBadge}>
          <Ionicons name="star" size={12} color="#fbbf24" />
          <Text style={styles.xpText}>+{item.xpEarned}</Text>
        </View>
      </View>
      
      <Text style={styles.promptText}>"{item.prompt}"</Text>
      <Text style={styles.responseText}>{item.response}</Text>
      
      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood={mascotMood} size={60} />
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Stone of Wisdom</Text>
            <Text style={styles.subtitleText}>Daily reflection and growth</Text>
          </View>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Ionicons name="calendar" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {showCalendar ? (
          // Reflection Calendar View
          <View style={styles.calendarView}>
            <Text style={styles.calendarTitle}>Your Reflection Journey</Text>
            <FlatList
              data={reflections}
              renderItem={renderReflectionCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.calendarList}
            />
          </View>
        ) : (
          // Daily Reflection View
          <ScrollView style={styles.reflectionView} showsVerticalScrollIndicator={false}>
            {currentPrompt && (
              <View style={styles.promptCard}>
                <View style={styles.promptHeader}>
                  <Ionicons name="diamond" size={24} color="#6366f1" />
                  <Text style={styles.promptTitle}>Today's Wisdom</Text>
                </View>
                <Text style={styles.promptText}>{currentPrompt.prompt}</Text>
              </View>
            )}

            {currentFollowUp >= 0 && followUpQuestions.length > 0 && (
              <View style={styles.followUpCard}>
                <Text style={styles.followUpTitle}>Deeper Reflection</Text>
                <Text style={styles.followUpQuestion}>
                  {followUpQuestions[currentFollowUp]}
                </Text>
              </View>
            )}

            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                value={userResponse}
                onChangeText={setUserResponse}
                placeholder={
                  currentFollowUp >= 0 
                    ? "Share your thoughts..."
                    : "What comes to mind when you reflect on this?"
                }
                placeholderTextColor="#9ca3af"
                multiline
                maxLength={1000}
                editable={!isLoading}
              />
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!userResponse.trim() || isLoading) && styles.submitButtonDisabled
                ]}
                onPress={submitReflection}
                disabled={!userResponse.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#ffffff" />
                    <Text style={styles.submitButtonText}>
                      {currentFollowUp >= 0 ? 'Continue' : 'Reflect'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {reflections.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.sectionTitle}>Recent Reflections</Text>
                {reflections.slice(0, 3).map((reflection) => (
                  <View key={reflection.id} style={styles.recentCard}>
                    <Text style={styles.recentPrompt}>"{reflection.prompt}"</Text>
                    <Text style={styles.recentResponse} numberOfLines={2}>
                      {reflection.response}
                    </Text>
                    <Text style={styles.recentDate}>
                      {reflection.timestamp.toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Crisis Support */}
        <TouchableOpacity
          style={styles.crisisButton}
          onPress={() => {
            Alert.alert(
              'Crisis Support',
              'If you\'re in crisis or need immediate support:\n\n• NEDA Helpline: 1-800-931-2237\n• Crisis Text Line: Text HOME to 741741\n• National Suicide Prevention Lifeline: 988',
              [{ text: 'OK', style: 'default' }]
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
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748b',
  },
  calendarButton: {
    padding: 8,
  },
  calendarView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginVertical: 20,
  },
  calendarList: {
    paddingBottom: 20,
  },
  reflectionView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  promptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  promptText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  followUpCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  followUpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  followUpQuestion: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  inputSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  recentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  recentResponse: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  recentDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  reflectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reflectionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#3730a3',
  },
  crisisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  crisisButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});