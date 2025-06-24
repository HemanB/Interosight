import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Colors } from '../constants/Colors';

export const DataConsentScreen: React.FC = () => {
  const [accepted, setAccepted] = useState(false);
  const { updatePreferences, userProfile } = useAuth();

  const handleAccept = async () => {
    try {
      await updatePreferences({ dataCollectionConsent: true });
      Alert.alert(
        'Thank You!',
        'Your data will help us improve InteroSight and provide better support to our community. All data is fully deidentified and used only for research and app improvement.',
        [{ text: 'Continue', onPress: () => {} }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    }
  };

  const handleDecline = async () => {
    try {
      await updatePreferences({ dataCollectionConsent: false });
      Alert.alert(
        'Understood',
        'You can change this setting anytime in the app settings.',
        [{ text: 'Continue', onPress: () => {} }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Data Collection & Privacy</ThemedText>
          <ThemedText style={styles.subtitle}>
            Help us improve InteroSight while protecting your privacy
          </ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>What We Collect</ThemedText>
            <ThemedText style={styles.text}>
              • Your meal logging data (foods, portions, timing, mood)
            </ThemedText>
            <ThemedText style={styles.text}>
              • Trigger and behavioral patterns
            </ThemedText>
            <ThemedText style={styles.text}>
              • Reflection entries and insights
            </ThemedText>
            <ThemedText style={styles.text}>
              • App usage patterns and preferences
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>How We Use Your Data</ThemedText>
            <ThemedText style={styles.text}>
              • Improve our AI recommendations and responses
            </ThemedText>
            <ThemedText style={styles.text}>
              • Train our language models to better understand eating disorders
            </ThemedText>
            <ThemedText style={styles.text}>
              • Identify patterns to develop better treatment strategies
            </ThemedText>
            <ThemedText style={styles.text}>
              • Personalize your experience and recommendations
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Privacy Protection</ThemedText>
            <ThemedText style={styles.text}>
              • All data is fully deidentified before analysis
            </ThemedText>
            <ThemedText style={styles.text}>
              • No personal information is ever shared
            </ThemedText>
            <ThemedText style={styles.text}>
              • Data is encrypted and stored securely
            </ThemedText>
            <ThemedText style={styles.text}>
              • You can opt out at any time
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Research Benefits</ThemedText>
            <ThemedText style={styles.text}>
              Your participation helps researchers understand:
            </ThemedText>
            <ThemedText style={styles.text}>
              • Common triggers and coping strategies
            </ThemedText>
            <ThemedText style={styles.text}>
              • Effective intervention timing
            </ThemedText>
            <ThemedText style={styles.text}>
              • Recovery patterns and success factors
            </ThemedText>
            <ThemedText style={styles.text}>
              • How to better support the eating disorder community
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
          >
            <Text style={styles.acceptButtonText}>
              I Accept - Help Improve InteroSight
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleDecline}
          >
            <Text style={styles.declineButtonText}>
              Not Now - I'll Decide Later
            </Text>
          </TouchableOpacity>

          <ThemedText style={styles.disclaimer}>
            You can change this setting anytime in Settings {'>'} Privacy & Data
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  content: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: Colors.light.tint,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
    opacity: 0.8,
  },
  footer: {
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  acceptButton: {
    backgroundColor: Colors.light.tint,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  declineButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 10,
  },
}); 