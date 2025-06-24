import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';

const { width } = Dimensions.get('window');

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'reflection' | 'tracking' | 'explore';
  xpReward: number;
  completed: boolean;
  icon: string;
}

interface TreeBranch {
  id: string;
  name: string;
  theme: string;
  level: number;
  maxLevel: number;
  color: string;
  unlocked: boolean;
}

export default function HomeScreen() {
  const [streak, setStreak] = useState(7);
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(5);
  const [characterName, setCharacterName] = useState('Wanderer');
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([
    { 
      id: '1', 
      title: 'Visit the Stone of Wisdom', 
      description: 'Complete today\'s reflection',
      type: 'reflection',
      xpReward: 50, 
      completed: false,
      icon: 'diamond'
    },
    { 
      id: '2', 
      title: 'Log Your Journey', 
      description: 'Track a meal or trigger',
      type: 'tracking',
      xpReward: 30, 
      completed: false,
      icon: 'list'
    },
    { 
      id: '3', 
      title: 'Explore New Territory', 
      description: 'Complete a map activity',
      type: 'explore',
      xpReward: 40, 
      completed: false,
      icon: 'map'
    },
  ]);

  const [treeBranches] = useState<TreeBranch[]>([
    {
      id: 'body-image',
      name: 'Body Image',
      theme: 'self-compassion',
      level: 3,
      maxLevel: 5,
      color: '#ec4899',
      unlocked: true,
    },
    {
      id: 'self-worth',
      name: 'Self-Worth',
      theme: 'confidence',
      level: 2,
      maxLevel: 5,
      color: '#8b5cf6',
      unlocked: true,
    },
    {
      id: 'relationships',
      name: 'Relationships',
      theme: 'boundaries',
      level: 1,
      maxLevel: 5,
      color: '#06b6d4',
      unlocked: false,
    },
    {
      id: 'emotions',
      name: 'Emotional Awareness',
      theme: 'processing',
      level: 0,
      maxLevel: 5,
      color: '#f59e0b',
      unlocked: false,
    },
  ]);

  const xpToNextLevel = 2000;
  const xpProgress = (xp % xpToNextLevel) / xpToNextLevel;

  const completeQuest = (id: string) => {
    setDailyQuests(prev => 
      prev.map(quest => 
        quest.id === id 
          ? { ...quest, completed: true }
          : quest
      )
    );
    
    const quest = dailyQuests.find(q => q.id === id);
    if (quest) {
      setXp(prev => prev + quest.xpReward);
      // Check for level up
      const newLevel = Math.floor((xp + quest.xpReward) / xpToNextLevel) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setCharacterName(getCharacterTitle(newLevel));
      }
    }
  };

  const getCharacterTitle = (level: number): string => {
    if (level >= 10) return 'Sage';
    if (level >= 7) return 'Explorer';
    if (level >= 4) return 'Seeker';
    return 'Wanderer';
  };

  const getQuestIcon = (type: Quest['type']) => {
    switch (type) {
      case 'reflection':
        return 'diamond';
      case 'tracking':
        return 'list';
      case 'explore':
        return 'map';
      default:
        return 'help-circle';
    }
  };

  const getQuestColor = (type: Quest['type']) => {
    switch (type) {
      case 'reflection':
        return '#6366f1';
      case 'tracking':
        return '#10b981';
      case 'explore':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Character */}
        <View style={styles.header}>
          <View style={styles.characterSection}>
            <Mascot mood="happy" size={80} />
            <View style={styles.characterInfo}>
              <Text style={styles.characterName}>{characterName}</Text>
              <Text style={styles.characterLevel}>Level {level}</Text>
            </View>
          </View>
          <Text style={styles.welcomeText}>Welcome to your inner world</Text>
          <Text style={styles.subtitleText}>Every reflection grows your wisdom</Text>
        </View>

        {/* Tree of Wisdom */}
        <View style={styles.treeSection}>
          <Text style={styles.sectionTitle}>Tree of Wisdom</Text>
          <Text style={styles.sectionSubtitle}>Your growth journey visualized</Text>
          
          <View style={styles.treeContainer}>
            {treeBranches.map((branch, index) => (
              <View key={branch.id} style={styles.branchRow}>
                <View style={styles.branchInfo}>
                  <View style={[
                    styles.branchIcon,
                    { backgroundColor: branch.color },
                    !branch.unlocked && styles.lockedBranch
                  ]}>
                    <Ionicons 
                      name={branch.unlocked ? 'leaf' : 'lock-closed'} 
                      size={16} 
                      color="#ffffff" 
                    />
                  </View>
                  <View style={styles.branchDetails}>
                    <Text style={[
                      styles.branchName,
                      !branch.unlocked && styles.lockedBranchName
                    ]}>
                      {branch.name}
                    </Text>
                    <Text style={styles.branchTheme}>{branch.theme}</Text>
                  </View>
                </View>
                <View style={styles.branchProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${(branch.level / branch.maxLevel) * 100}%`,
                          backgroundColor: branch.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {branch.level}/{branch.maxLevel}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Quests */}
        <View style={styles.questsSection}>
          <Text style={styles.sectionTitle}>Today's Quests</Text>
          <Text style={styles.sectionSubtitle}>Complete these to grow your wisdom</Text>
          
          {dailyQuests.map((quest) => (
            <TouchableOpacity
              key={quest.id}
              style={[
                styles.questCard,
                quest.completed && styles.questCompleted
              ]}
              onPress={() => !quest.completed && completeQuest(quest.id)}
              disabled={quest.completed}
            >
              <View style={styles.questContent}>
                <View style={styles.questLeft}>
                  <View style={[
                    styles.questIcon,
                    { backgroundColor: getQuestColor(quest.type) },
                    quest.completed && styles.questIconCompleted
                  ]}>
                    <Ionicons 
                      name={quest.icon as any} 
                      size={20} 
                      color="#ffffff" 
                    />
                  </View>
                  <View style={styles.questText}>
                    <Text style={[
                      styles.questTitle,
                      quest.completed && styles.questTitleCompleted
                    ]}>
                      {quest.title}
                    </Text>
                    <Text style={styles.questDescription}>
                      {quest.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.questReward}>
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text style={styles.questRewardText}>{quest.xpReward}</Text>
                  {quest.completed && (
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#f97316" />
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#fbbf24" />
            <Text style={styles.statNumber}>{xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="heart" size={24} color="#ec4899" />
          <Text style={styles.encouragementText}>
            Your journey is unique and beautiful. Every reflection is a step toward inner wisdom.
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
  characterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  characterInfo: {
    marginLeft: 16,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  characterLevel: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  treeSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  treeContainer: {
    gap: 12,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  branchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lockedBranch: {
    backgroundColor: '#9ca3af',
  },
  branchDetails: {
    flex: 1,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  lockedBranchName: {
    color: '#9ca3af',
  },
  branchTheme: {
    fontSize: 12,
    color: '#6b7280',
  },
  branchProgress: {
    alignItems: 'flex-end',
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  questsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questCard: {
    marginBottom: 12,
  },
  questCompleted: {
    opacity: 0.6,
  },
  questContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  questIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questIconCompleted: {
    backgroundColor: '#10b981',
  },
  questText: {
    flex: 1,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  questTitleCompleted: {
    color: '#10b981',
  },
  questDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questRewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 4,
    marginRight: 8,
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  encouragementCard: {
    backgroundColor: '#fdf2f8',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
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