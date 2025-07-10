import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, description, icon, onPress, color }) => {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );
};

const SettingsScreen: React.FC = () => {
  const handleAccountSettings = () => {
    Alert.alert('Account Settings', 'Profile, email, character, username management');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Manage notification preferences and crisis alerts');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy & Data', 'Privacy settings, data export, and deletion');
  };

  const handleAppPreferences = () => {
    Alert.alert('App Preferences', 'Theme, animations, sound, and accessibility');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'App help, tutorials, and support resources');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>App preferences and account management</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Preferences</Text>
          <SettingsCard
            title="Account Settings"
            description="Profile, email, character, username management"
            icon="person"
            onPress={handleAccountSettings}
            color="#007AFF"
          />
          <SettingsCard
            title="Notifications"
            description="Manage notification preferences and crisis alerts"
            icon="notifications"
            onPress={handleNotifications}
            color="#34C759"
          />
          <SettingsCard
            title="Privacy & Data"
            description="Privacy settings, data export, and deletion"
            icon="lock-closed"
            onPress={handlePrivacy}
            color="#FF9500"
          />
          <SettingsCard
            title="App Preferences"
            description="Theme, animations, sound, and accessibility"
            icon="options"
            onPress={handleAppPreferences}
            color="#AF52DE"
          />
          <SettingsCard
            title="Help & Support"
            description="App help, tutorials, and support resources"
            icon="help-circle"
            onPress={handleHelp}
            color="#5856D6"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For crisis support and therapeutic tools, visit the Resources tab.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default SettingsScreen; 