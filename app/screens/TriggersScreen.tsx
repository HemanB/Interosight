import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';

interface TriggerLog {
  id: string;
  trigger: string;
  severity: number;
  copingStrategy: string;
  timestamp: Date;
}

export default function TriggersScreen() {
  const [trigger, setTrigger] = useState('');
  const [severity, setSeverity] = useState(5);
  const [copingStrategy, setCopingStrategy] = useState('');
  const [triggerLogs, setTriggerLogs] = useState<TriggerLog[]>([]);
  const [mascotMood, setMascotMood] = useState<'happy' | 'supportive' | 'concerned'>('happy');

  const severityLevels = [
    { level: 1, label: 'Mild', color: '#10b981' },
    { level: 3, label: 'Moderate', color: '#f59e0b' },
    { level: 5, label: 'Strong', color: '#f97316' },
    { level: 7, label: 'Intense', color: '#dc2626' },
    { level: 10, label: 'Crisis', color: '#7c2d12' },
  ];

  const dbtTools = [
    {
      title: '5-4-3-2-1 Grounding',
      description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
      icon: 'leaf',
      color: '#10b981',
    },
    {
      title: 'Deep Breathing',
      description: 'Breathe in for 4, hold for 4, breathe out for 6',
      icon: 'airplane',
      color: '#6366f1',
    },
    {
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and release each muscle group from toes to head',
      icon: 'body',
      color: '#ec4899',
    },
    {
      title: 'Self-Compassion Break',
      description: 'Place hand on heart and say kind words to yourself',
      icon: 'heart',
      color: '#f59e0b',
    },
  ];

  const emergencyContacts = [
    {
      name: 'NEDA Helpline',
      number: '1-800-931-2237',
      description: 'National Eating Disorders Association',
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: '24/7 Crisis Support',
    },
    {
      name: 'Suicide Prevention',
      number: '988',
      description: 'National Suicide Prevention Lifeline',
    },
  ];

  const saveTrigger = () => {
    if (!trigger.trim()) {
      Alert.alert('Missing Information', 'Please describe what triggered you.');
      return;
    }

    const newTrigger: TriggerLog = {
      id: Date.now().toString(),
      trigger: trigger.trim(),
      severity,
      copingStrategy: copingStrategy.trim(),
      timestamp: new Date(),
    };

    setTriggerLogs(prev => [newTrigger, ...prev]);
    setTrigger('');
    setSeverity(5);
    setCopingStrategy('');
    setMascotMood('supportive');

    setTimeout(() => {
      setMascotMood('happy');
      Alert.alert(
        'Trigger Logged',
        'Thank you for sharing. Remember, triggers are temporary and you have tools to cope.',
        [{ text: 'OK', style: 'default' }]
      );
    }, 2000);
  };

  const callEmergencyContact = (contact: any) => {
    Alert.alert(
      'Emergency Contact',
      `Call ${contact.name}?\n${contact.number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            if (contact.number.includes('Text')) {
              // For text-based services, show instructions
              Alert.alert(
                'Text Support',
                `To get help:\n\n${contact.number}\n\nThis will connect you with a trained crisis counselor.`,
                [{ text: 'OK', style: 'default' }]
              );
            } else {
              // For phone numbers, attempt to call
              Linking.openURL(`tel:${contact.number}`);
            }
          }
        }
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood={mascotMood} size={80} />
          <Text style={styles.headerTitle}>Triggers & Patterns</Text>
          <Text style={styles.headerSubtitle}>
            Track triggers and access coping tools
          </Text>
        </View>

        {/* Crisis Tools - Always visible */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Crisis Tools</Text>
          <Text style={styles.sectionSubtitle}>
            Quick access to support when you need it most
          </Text>
          
          <View style={styles.crisisTools}>
            {emergencyContacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emergencyContact}
                onPress={() => callEmergencyContact(contact)}
              >
                <View style={styles.emergencyContactIcon}>
                  <Ionicons name="call" size={20} color="#dc2626" />
                </View>
                <View style={styles.emergencyContactInfo}>
                  <Text style={styles.emergencyContactName}>{contact.name}</Text>
                  <Text style={styles.emergencyContactNumber}>{contact.number}</Text>
                  <Text style={styles.emergencyContactDesc}>{contact.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DBT Tools */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Coping Tools</Text>
          <Text style={styles.sectionSubtitle}>
            Evidence-based techniques to help you through difficult moments
          </Text>
          
          <View style={styles.dbtTools}>
            {dbtTools.map((tool, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dbtTool}
                onPress={() => {
                  Alert.alert(
                    tool.title,
                    tool.description,
                    [{ text: 'OK', style: 'default' }]
                  );
                }}
              >
                <View style={[styles.dbtToolIcon, { backgroundColor: tool.color }]}>
                  <Ionicons name={tool.icon as any} size={20} color="#ffffff" />
                </View>
                <View style={styles.dbtToolInfo}>
                  <Text style={styles.dbtToolTitle}>{tool.title}</Text>
                  <Text style={styles.dbtToolDesc}>{tool.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trigger Logging */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Log a Trigger</Text>
          <Text style={styles.sectionSubtitle}>
            Understanding your triggers helps you prepare and cope better
          </Text>
          
          <TextInput
            style={styles.triggerInput}
            value={trigger}
            onChangeText={setTrigger}
            placeholder="What triggered you? (e.g., 'Seeing calorie counts on menus')"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.severityLabel}>How intense is this trigger?</Text>
          <View style={styles.severityContainer}>
            {severityLevels.map((level) => (
              <TouchableOpacity
                key={level.level}
                style={[
                  styles.severityButton,
                  severity === level.level && styles.severityButtonSelected,
                  { borderColor: level.color }
                ]}
                onPress={() => setSeverity(level.level)}
              >
                <Text style={[
                  styles.severityText,
                  severity === level.level && styles.severityTextSelected,
                  { color: level.color }
                ]}>
                  {level.level}
                </Text>
                <Text style={[
                  styles.severityLabel,
                  severity === level.level && styles.severityLabelSelected
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.copingInput}
            value={copingStrategy}
            onChangeText={setCopingStrategy}
            placeholder="What helped you cope? (optional)"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={2}
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              !trigger.trim() && styles.saveButtonDisabled
            ]}
            onPress={saveTrigger}
            disabled={!trigger.trim()}
          >
            <Ionicons name="save" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Log Trigger</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Triggers */}
        {triggerLogs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recent Triggers</Text>
            {triggerLogs.slice(0, 3).map((log) => (
              <View key={log.id} style={styles.triggerLogItem}>
                <View style={styles.triggerLogHeader}>
                  <Text style={styles.triggerLogTime}>
                    {formatTime(log.timestamp)}
                  </Text>
                  <View style={[
                    styles.severityBadge,
                    { backgroundColor: severityLevels.find(l => l.level === log.severity)?.color }
                  ]}>
                    <Text style={styles.severityBadgeText}>
                      Level {log.severity}
                    </Text>
                  </View>
                </View>
                <Text style={styles.triggerLogText}>{log.trigger}</Text>
                {log.copingStrategy && (
                  <Text style={styles.copingLogText}>
                    Coping: {log.copingStrategy}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10b981" />
          <Text style={styles.encouragementText}>
            You are stronger than your triggers. Every time you use a coping tool, you're building resilience.
          </Text>
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
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  crisisTools: {
    gap: 12,
  },
  emergencyContact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyContactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emergencyContactInfo: {
    flex: 1,
  },
  emergencyContactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  emergencyContactNumber: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  emergencyContactDesc: {
    fontSize: 12,
    color: '#991b1b',
  },
  dbtTools: {
    gap: 12,
  },
  dbtTool: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dbtToolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dbtToolInfo: {
    flex: 1,
  },
  dbtToolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  dbtToolDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  triggerInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 12,
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  severityButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 60,
  },
  severityButtonSelected: {
    backgroundColor: '#6366f1',
  },
  severityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  severityTextSelected: {
    color: '#ffffff',
  },
  severityLabelSelected: {
    color: '#ffffff',
  },
  copingInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  triggerLogItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  triggerLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  triggerLogTime: {
    fontSize: 12,
    color: '#64748b',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  triggerLogText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 4,
  },
  copingLogText: {
    fontSize: 14,
    color: '#10b981',
    fontStyle: 'italic',
  },
  encouragementCard: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
}); 