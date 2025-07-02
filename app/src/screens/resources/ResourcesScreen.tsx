import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmergencyContactsModal from './EmergencyContactsModal';
import CrisisHotlinesModal from './CrisisHotlinesModal';

interface ResourceCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ title, description, icon, onPress, color }) => {
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

const ResourcesScreen: React.FC = () => {
  const [emergencyContactsVisible, setEmergencyContactsVisible] = useState(false);
  const [crisisHotlinesVisible, setCrisisHotlinesVisible] = useState(false);

  const handleEmergencyContacts = () => {
    setEmergencyContactsVisible(true);
  };

  const handleCrisisHotlines = () => {
    setCrisisHotlinesVisible(true);
  };

  const handleDBTTools = () => {
    Alert.alert('DBT Tools', 'This will open DBT (Dialectical Behavior Therapy) tools');
  };

  const handleGroundingExercises = () => {
    Alert.alert('Grounding Exercises', 'This will open grounding and breathing exercises');
  };

  const handleSafetyPlanning = () => {
    Alert.alert('Safety Planning', 'This will help create a personalized safety plan');
  };

  const handleProfessionalResources = () => {
    Alert.alert('Professional Resources', 'This will show therapist finder and treatment centers');
  };

  const handleCopingStrategies = () => {
    Alert.alert('Coping Strategies', 'This will show various coping techniques and strategies');
  };

  const handleEducationalResources = () => {
    Alert.alert('Educational Resources', 'This will show educational materials about eating disorders');
  };

  const handleSupportGroups = () => {
    Alert.alert('Support Groups', 'This will show local and online support group options');
  };

  const handleSelfCareTools = () => {
    Alert.alert('Self-Care Tools', 'This will show self-care activities and wellness tools');
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.subtitle}>Tools and support for your recovery journey</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency & Crisis</Text>
        <ResourceCard
          title="Emergency Contacts"
          description="Manage your emergency contacts for quick access"
          icon="people"
          onPress={handleEmergencyContacts}
          color="#FF6B6B"
        />
        <ResourceCard
          title="Crisis Hotlines"
          description="24/7 crisis support and suicide prevention hotlines"
          icon="call"
          onPress={handleCrisisHotlines}
          color="#FF8E53"
        />
        <ResourceCard
          title="Safety Planning"
          description="Create a personalized safety plan for crisis moments"
          icon="shield-checkmark"
          onPress={handleSafetyPlanning}
          color="#FFB347"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Therapeutic Tools</Text>
        <ResourceCard
          title="DBT Tools"
          description="Dialectical Behavior Therapy techniques and exercises"
          icon="heart"
          onPress={handleDBTTools}
          color="#4ECDC4"
        />
        <ResourceCard
          title="Grounding Exercises"
          description="Breathing and grounding techniques for immediate relief"
          icon="leaf"
          onPress={handleGroundingExercises}
          color="#45B7D1"
        />
        <ResourceCard
          title="Coping Strategies"
          description="Various coping techniques for difficult moments"
          icon="bulb"
          onPress={handleCopingStrategies}
          color="#96CEB4"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Support</Text>
        <ResourceCard
          title="Professional Resources"
          description="Find therapists, treatment centers, and specialists"
          icon="medical"
          onPress={handleProfessionalResources}
          color="#A8E6CF"
        />
        <ResourceCard
          title="Support Groups"
          description="Local and online support group options"
          icon="people-circle"
          onPress={handleSupportGroups}
          color="#DCEDC8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education & Wellness</Text>
        <ResourceCard
          title="Educational Resources"
          description="Learn more about eating disorders and recovery"
          icon="library"
          onPress={handleEducationalResources}
          color="#FFD93D"
        />
        <ResourceCard
          title="Self-Care Tools"
          description="Wellness activities and self-care practices"
          icon="sparkles"
          onPress={handleSelfCareTools}
          color="#FF6B9D"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Remember: This app is not a replacement for professional treatment. 
          Always seek help from qualified healthcare providers.
        </Text>
      </View>
    </ScrollView>

            <EmergencyContactsModal
        visible={emergencyContactsVisible}
        onClose={() => setEmergencyContactsVisible(false)}
      />
      <CrisisHotlinesModal
        visible={crisisHotlinesVisible}
        onClose={() => setCrisisHotlinesVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
    color: '#2c3e50',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    marginTop: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default ResourcesScreen; 