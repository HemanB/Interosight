import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';

export default function CommunityScreen() {
  const [mascotMood, setMascotMood] = useState<'happy' | 'supportive'>('happy');

  const communityFeatures = [
    {
      title: 'Recovery Stories',
      description: 'Read inspiring stories from others on their recovery journey',
      icon: 'book',
      color: '#6366f1',
      comingSoon: true,
    },
    {
      title: 'Support Groups',
      description: 'Connect with others in a safe, moderated environment',
      icon: 'people',
      color: '#10b981',
      comingSoon: true,
    },
    {
      title: 'Recovery Milestones',
      description: 'Celebrate your progress and support others',
      icon: 'trophy',
      color: '#f59e0b',
      comingSoon: true,
    },
    {
      title: 'Resource Sharing',
      description: 'Share helpful resources and coping strategies',
      icon: 'share',
      color: '#ec4899',
      comingSoon: true,
    },
  ];

  const safetyGuidelines = [
    'No triggering content about specific eating behaviors',
    'No calorie counting or weight discussions',
    'No medical advice or treatment recommendations',
    'Respectful and supportive communication only',
    'Report any concerning content immediately',
  ];

  const handleFeaturePress = (feature: any) => {
    if (feature.comingSoon) {
      Alert.alert(
        'Coming Soon',
        `${feature.title} is currently in development. We're working hard to create a safe and supportive community space for everyone.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood={mascotMood} size={80} />
          <Text style={styles.headerTitle}>Community</Text>
          <Text style={styles.headerSubtitle}>
            Connect with others on their recovery journey
          </Text>
        </View>

        {/* Coming Soon Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="construct" size={24} color="#f59e0b" />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Community Features Coming Soon</Text>
            <Text style={styles.noticeText}>
              We're carefully designing community features that prioritize safety and support. 
              Our team is working to create a space where everyone feels welcome and protected.
            </Text>
          </View>
        </View>

        {/* Planned Features */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Planned Community Features</Text>
          <Text style={styles.sectionSubtitle}>
            These features are being developed with your safety and well-being in mind
          </Text>
          
          <View style={styles.featuresGrid}>
            {communityFeatures.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={() => handleFeaturePress(feature)}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon as any} size={24} color="#ffffff" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                {feature.comingSoon && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Safety Guidelines */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Community Safety Guidelines</Text>
          <Text style={styles.sectionSubtitle}>
            Our community will be built on these core principles
          </Text>
          
          <View style={styles.guidelinesList}>
            {safetyGuidelines.map((guideline, index) => (
              <View key={index} style={styles.guidelineItem}>
                <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                <Text style={styles.guidelineText}>{guideline}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Alternative Support */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Support Resources</Text>
          <Text style={styles.sectionSubtitle}>
            While community features are in development, here are some ways to connect
          </Text>
          
          <TouchableOpacity
            style={styles.supportOption}
            onPress={() => {
              Alert.alert(
                'Professional Support',
                'Consider reaching out to:\n\n• Your treatment team\n• Support groups in your area\n• Online recovery communities (with caution)\n• NEDA support resources',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Ionicons name="medical" size={20} color="#6366f1" />
            <Text style={styles.supportOptionText}>Professional Support Networks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.supportOption}
            onPress={() => {
              Alert.alert(
                'Reflect & Chat',
                'Use the Reflect tab to chat with InteroSight about your feelings and experiences.',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Ionicons name="chatbubbles" size={20} color="#6366f1" />
            <Text style={styles.supportOptionText}>Chat with InteroSight</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Help Shape Our Community</Text>
          <Text style={styles.sectionSubtitle}>
            We want to hear from you about what community features would be most helpful
          </Text>
          
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => {
              Alert.alert(
                'Community Feedback',
                'Thank you for your interest! We\'re currently gathering feedback about community features. Your input helps us create a safe and supportive space for everyone.',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Ionicons name="chatbox" size={20} color="#ffffff" />
            <Text style={styles.feedbackButtonText}>Share Your Ideas</Text>
          </TouchableOpacity>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="heart" size={24} color="#ec4899" />
          <Text style={styles.encouragementText}>
            You're not alone in your recovery journey. Community support is coming soon, and we're committed to making it a safe space for everyone.
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
  noticeCard: {
    backgroundColor: '#fffbeb',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
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
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  guidelinesList: {
    gap: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guidelineText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  supportOption: {
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
  supportOptionText: {
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