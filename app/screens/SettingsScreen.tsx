import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [crisisAlerts, setCrisisAlerts] = useState(true);
  const [mascotAnimations, setMascotAnimations] = useState(true);
  const [mascotMood, setMascotMood] = useState<'happy' | 'supportive'>('happy');

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          subtitle: 'Receive reminders and updates',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
          icon: 'notifications',
        },
        {
          title: 'Daily Reminders',
          subtitle: 'Gentle reminders to check in',
          type: 'switch',
          value: dailyReminders,
          onValueChange: setDailyReminders,
          icon: 'time',
        },
        {
          title: 'Crisis Alerts',
          subtitle: 'Important safety notifications',
          type: 'switch',
          value: crisisAlerts,
          onValueChange: setCrisisAlerts,
          icon: 'warning',
        },
      ],
    },
    {
      title: 'App Experience',
      items: [
        {
          title: 'Mascot Animations',
          subtitle: 'Show animated mascot responses',
          type: 'switch',
          value: mascotAnimations,
          onValueChange: setMascotAnimations,
          icon: 'happy',
        },
        {
          title: 'App Theme',
          subtitle: 'Light theme (dark mode coming soon)',
          type: 'info',
          icon: 'color-palette',
        },
        {
          title: 'Language',
          subtitle: 'English (more languages coming soon)',
          type: 'info',
          icon: 'language',
        },
      ],
    },
    {
      title: 'Support & Resources',
      items: [
        {
          title: 'Crisis Resources',
          subtitle: 'Emergency contacts and support',
          type: 'action',
          icon: 'call',
          onPress: () => {
            Alert.alert(
              'Crisis Resources',
              'If you\'re in crisis:\n\n• NEDA Helpline: 1-800-931-2237\n• Crisis Text Line: Text HOME to 741741\n• National Suicide Prevention Lifeline: 988\n\nWould you like to call one of these numbers?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call NEDA', onPress: () => Linking.openURL('tel:1-800-931-2237') },
                { text: 'Call 988', onPress: () => Linking.openURL('tel:988') },
              ]
            );
          },
        },
        {
          title: 'Professional Help',
          subtitle: 'Find treatment providers in your area',
          type: 'action',
          icon: 'medical',
          onPress: () => {
            Alert.alert(
              'Professional Help',
              'Finding the right treatment team is important. Consider:\n\n• Asking your primary care doctor for referrals\n• Contacting NEDA for provider recommendations\n• Looking for eating disorder specialists\n• Checking with your insurance for covered providers',
              [{ text: 'OK', style: 'default' }]
            );
          },
        },
        {
          title: 'Educational Resources',
          subtitle: 'Learn more about eating disorders and recovery',
          type: 'action',
          icon: 'library',
          onPress: () => {
            Alert.alert(
              'Educational Resources',
              'Recommended resources:\n\n• National Eating Disorders Association (NEDA)\n• Eating Disorder Hope\n• National Alliance for Eating Disorders\n• Your treatment team\'s recommendations',
              [{ text: 'OK', style: 'default' }]
            );
          },
        },
      ],
    },
    {
      title: 'App Information',
      items: [
        {
          title: 'About InteroSight',
          subtitle: 'Version 1.0.0',
          type: 'info',
          icon: 'information-circle',
        },
        {
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          type: 'action',
          icon: 'shield-checkmark',
          onPress: () => {
            Alert.alert(
              'Privacy Policy',
              'Your privacy is important to us. We:\n\n• Never share your personal data\n• Use encryption to protect your information\n• Allow you to delete your data anytime\n• Don\'t track your location or personal details\n\nYour recovery journey is private and secure.',
              [{ text: 'OK', style: 'default' }]
            );
          },
        },
        {
          title: 'Terms of Service',
          subtitle: 'App usage guidelines',
          type: 'action',
          icon: 'document-text',
          onPress: () => {
            Alert.alert(
              'Terms of Service',
              'InteroSight is designed to support your recovery journey, but:\n\n• It\'s not a replacement for professional treatment\n• We\'re not liable for medical decisions\n• Use the app responsibly and safely\n• Contact professionals for medical advice',
              [{ text: 'OK', style: 'default' }]
            );
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    return (
      <View key={item.title} style={styles.settingItem}>
        <View style={styles.settingItemLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name={item.icon as any} size={20} color="#6366f1" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        
        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
            thumbColor={item.value ? '#ffffff' : '#f3f4f6'}
          />
        )}
        
        {item.type === 'action' && (
          <TouchableOpacity onPress={item.onPress}>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
        
        {item.type === 'info' && (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood={mascotMood} size={80} />
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your InteroSight experience
          </Text>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.settingsList}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* Data Management */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity
            style={styles.dataOption}
            onPress={() => {
              Alert.alert(
                'Export Data',
                'You can export your data for your records. This includes your meal logs, trigger logs, and chat history.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Export', style: 'default' }
                ]
              );
            }}
          >
            <Ionicons name="download" size={20} color="#6366f1" />
            <Text style={styles.dataOptionText}>Export My Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dataOption}
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This will permanently remove all your data and cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been deleted. We hope InteroSight was helpful in your recovery journey.',
                        [{ text: 'OK', style: 'default' }]
                      );
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="trash" size={20} color="#dc2626" />
            <Text style={[styles.dataOptionText, { color: '#dc2626' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Help Us Improve</Text>
          <Text style={styles.sectionSubtitle}>
            Your feedback helps us make InteroSight better for everyone
          </Text>
          
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => {
              Alert.alert(
                'Thank You!',
                'We appreciate your feedback. Your input helps us create better tools for recovery support.',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Ionicons name="chatbox" size={20} color="#ffffff" />
            <Text style={styles.feedbackButtonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="heart" size={24} color="#ec4899" />
          <Text style={styles.encouragementText}>
            Thank you for being part of the InteroSight community. Your recovery journey matters.
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
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingsList: {
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  dataOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dataOptionText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
  feedbackButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  feedbackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  encouragementCard: {
    backgroundColor: '#fdf2f8',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 14,
    color: '#831843',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
}); 