import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';

interface LogEntry {
  id: string;
  type: 'meal' | 'trigger';
  content: string;
  timestamp: Date;
  emotions?: string[];
}

export default function TrackingScreen() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'meal' | 'trigger'>('meal');
  const [inputText, setInputText] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  const emotionOptions = [
    'Anxious', 'Stressed', 'Happy', 'Sad', 'Angry', 'Excited', 'Calm', 'Overwhelmed'
  ];

  const addEntry = () => {
    if (!inputText.trim()) return;

    const newEntry: LogEntry = {
      id: Date.now().toString(),
      type: activeTab,
      content: inputText.trim(),
      timestamp: new Date(),
      emotions: selectedEmotions.length > 0 ? selectedEmotions : undefined,
    };

    setEntries(prev => [newEntry, ...prev]);
    setInputText('');
    setSelectedEmotions([]);
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const getPlaceholderText = () => {
    return activeTab === 'meal' 
      ? "What did you eat? (No calories needed!)"
      : "What triggered difficult feelings today?";
  };

  const getTabIcon = (type: 'meal' | 'trigger') => {
    return type === 'meal' ? 'restaurant' : 'warning';
  };

  const getTabColor = (type: 'meal' | 'trigger') => {
    return type === 'meal' ? '#10b981' : '#f59e0b';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood="supportive" size={60} />
          <Text style={styles.headerText}>Simple Tracking</Text>
          <Text style={styles.subtitleText}>Log meals and triggers without judgment</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'meal' && styles.activeTab,
              activeTab === 'meal' && { borderColor: getTabColor('meal') }
            ]}
            onPress={() => setActiveTab('meal')}
          >
            <Ionicons 
              name={getTabIcon('meal')} 
              size={20} 
              color={activeTab === 'meal' ? getTabColor('meal') : '#64748b'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'meal' && { color: getTabColor('meal') }
            ]}>
              Meal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'trigger' && styles.activeTab,
              activeTab === 'trigger' && { borderColor: getTabColor('trigger') }
            ]}
            onPress={() => setActiveTab('trigger')}
          >
            <Ionicons 
              name={getTabIcon('trigger')} 
              size={20} 
              color={activeTab === 'trigger' ? getTabColor('trigger') : '#64748b'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'trigger' && { color: getTabColor('trigger') }
            ]}>
              Trigger
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={getPlaceholderText()}
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={200}
          />

          {/* Emotion Selector */}
          <Text style={styles.emotionLabel}>How are you feeling? (Optional)</Text>
          <View style={styles.emotionContainer}>
            {emotionOptions.map((emotion) => (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.emotionChip,
                  selectedEmotions.includes(emotion) && styles.selectedEmotionChip
                ]}
                onPress={() => toggleEmotion(emotion)}
              >
                <Text style={[
                  styles.emotionText,
                  selectedEmotions.includes(emotion) && styles.selectedEmotionText
                ]}>
                  {emotion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              !inputText.trim() && styles.addButtonDisabled
            ]}
            onPress={addEntry}
            disabled={!inputText.trim()}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Entries */}
        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No entries yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking to see your patterns and progress
              </Text>
            </View>
          ) : (
            entries.slice(0, 10).map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Ionicons 
                    name={getTabIcon(entry.type)} 
                    size={16} 
                    color={getTabColor(entry.type)} 
                  />
                  <Text style={styles.entryType}>
                    {entry.type === 'meal' ? 'Meal' : 'Trigger'}
                  </Text>
                  <Text style={styles.entryTime}>
                    {entry.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
                <Text style={styles.entryContent}>{entry.content}</Text>
                {entry.emotions && entry.emotions.length > 0 && (
                  <View style={styles.emotionTags}>
                    {entry.emotions.map((emotion) => (
                      <View key={emotion} style={styles.emotionTag}>
                        <Text style={styles.emotionTagText}>{emotion}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#f1f5f9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  inputSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
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
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  emotionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  emotionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  emotionChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedEmotionChip: {
    backgroundColor: '#6366f1',
  },
  emotionText: {
    fontSize: 12,
    color: '#374151',
  },
  selectedEmotionText: {
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  entriesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
  },
  entryTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  entryContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emotionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  emotionTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  emotionTagText: {
    fontSize: 11,
    color: '#92400e',
  },
}); 