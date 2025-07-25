import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface ModuleCardProps {
  id: number;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed';
  progress?: number;
  onPress: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  id, 
  title, 
  description, 
  status, 
  progress = 0, 
  onPress 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#34C759';
      case 'available': return '#007AFF';
      case 'locked': return '#8E8E93';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'available': return 'play-circle';
      case 'locked': return 'lock-closed';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.moduleCard, { opacity: status === 'locked' ? 0.6 : 1 }]} 
      onPress={onPress}
      disabled={status === 'locked'}
    >
      <View style={styles.moduleHeader}>
        <View style={[styles.moduleIcon, { backgroundColor: getStatusColor() }]}>
          <Ionicons name={getStatusIcon() as any} size={24} color="white" />
        </View>
        <View style={styles.moduleInfo}>
          <Text style={styles.moduleTitle}>{title}</Text>
          <Text style={styles.moduleDescription}>{description}</Text>
        </View>
        <View style={styles.moduleStatus}>
          <Text style={[styles.moduleStatusText, { color: getStatusColor() }]}>
            {status === 'completed' ? 'Complete' : status === 'available' ? 'Start' : 'Locked'}
          </Text>
        </View>
      </View>
      
      {status === 'completed' && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const BASE_MODULES = [
  {
    id: 1,
    title: 'Introduction',
    description: 'Setting the stage for recovery and onboarding',
    status: 'available' as 'locked' | 'available' | 'completed',
    progress: 0,
    submodules: [
      {
        id: 1,
        title: 'Welcome & Privacy',
        prompt: 'What brings you here today?'
      },
      {
        id: 2,
        title: 'Your Hopes',
        prompt: 'What would you like this space to help you with?'
      },
      {
        id: 3,
        title: 'Getting Started',
        prompt: 'How are you feeling about starting this?'
      },
      {
        id: 4,
        title: 'Voice of the Space',
        prompt: 'If this journaling space had a voice, what would you want it to say back to you?'
      }
    ]
  },
  {
    id: 2,
    title: 'Identity',
    description: 'Who you are beyond the eating disorder',
    status: 'locked' as 'locked' | 'available' | 'completed',
    progress: 0,
    submodules: [
      {
        id: 1,
        title: 'Roles',
        prompt: 'What roles do you play in your life? Which feel most authentic to you?'
      },
      {
        id: 2,
        title: 'Values',
        prompt: 'What values guide your decisions or relationships?'
      },
      {
        id: 3,
        title: 'True Self',
        prompt: 'When do you feel most like yourself?'
      },
      {
        id: 4,
        title: 'Hidden Aspects',
        prompt: 'What’s something others might not see about you that you wish they did?'
      }
    ]
  },
  {
    id: 3,
    title: 'Your Journey',
    description: 'Delving into what brought you here and your recovery path',
    status: 'locked' as 'locked' | 'available' | 'completed',
    progress: 0,
    submodules: [
      {
        id: 1,
        title: 'Why Now?',
        prompt: 'Why now? Why are you engaging with this tool at this point in your journey?'
      },
      {
        id: 2,
        title: 'Getting Better',
        prompt: 'What does “getting better” mean to you?'
      },
      {
        id: 3,
        title: 'First Signs',
        prompt: 'When did you first start noticing something felt off?'
      },
      {
        id: 4,
        title: 'What Helped or Hurt',
        prompt: 'What has helped or hurt your recovery efforts so far?'
      }
    ]
  }
];

const HomeScreen: React.FC = () => {
  const [modules, setModules] = useState(BASE_MODULES);
  const navigation = useNavigation();

  const handleModulePress = (moduleId: number) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      navigation.navigate('ModuleScreen', { module: mod });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Journey</Text>
          <Text style={styles.subtitle}>3 core modules to start your recovery journey</Text>
        </View>
        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.progressTitle}>Progress</Text>
            </View>
            <Text style={styles.progressText}>
              {modules.filter(m => m.status === 'completed').length} of {modules.length} modules completed
            </Text>
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={20} color="#FF6B6B" />
              <Text style={styles.streakText}>0 day streak</Text>
            </View>
          </View>
        </View>
        {/* Module Pathway */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Core Modules</Text>
          <Text style={styles.sectionDescription}>
            Complete these foundational modules to unlock personalized content
          </Text>
          {modules.map((module, index) => (
            <View key={module.id}>
              <ModuleCard
                id={module.id}
                title={module.title}
                description={module.description}
                status={module.status}
                progress={module.progress}
                onPress={() => handleModulePress(module.id)}
              />
              {index < modules.length - 1 && (
                <View style={styles.connector}>
                  <View style={styles.connectorLine} />
                  <View style={styles.connectorDot} />
                </View>
              )}
            </View>
          ))}
        </View>
        {/* Coming Soon */}
        <View style={styles.comingSoonSection}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <View style={styles.comingSoonCard}>
            <Ionicons name="sparkles" size={24} color="#FF6B9D" />
            <Text style={styles.comingSoonTitle}>Dynamic Modules</Text>
            <Text style={styles.comingSoonDescription}>
              After completing core modules, unlock personalized content based on your data and insights.
            </Text>
          </View>
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
  progressSection: {
    padding: 20,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  modulesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  moduleStatus: {
    alignItems: 'flex-end',
  },
  moduleStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
  connector: {
    alignItems: 'center',
    marginVertical: 8,
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
  },
  connectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  quickActionsSection: {
    padding: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginTop: 8,
  },
  comingSoonSection: {
    padding: 20,
    paddingBottom: 40,
  },
  comingSoonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 8,
  },
  comingSoonDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen; 