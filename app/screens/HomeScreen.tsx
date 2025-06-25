import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  xpReward: number;
}

// Streak Card Component
const StreakCard = ({ streak }: { streak: number }) => (
  <View style={styles.card}>
    <View style={styles.streakHeader}>
      <Ionicons name="flame" size={24} color="#f97316" />
      <Text style={styles.streakTitle}>Recovery Streak</Text>
    </View>
    <Text style={styles.streakNumber}>{streak} days</Text>
    <Text style={styles.streakSubtext}>Keep up the great work!</Text>
  </View>
);

// Level Progress Component
const LevelProgress = ({ level, xp, xpToNextLevel }: { level: number; xp: number; xpToNextLevel: number }) => {
  const xpProgress = (xp % xpToNextLevel) / xpToNextLevel;
  
  return (
    <View style={styles.card}>
      <View style={styles.levelHeader}>
        <Text style={styles.levelTitle}>Level {level}</Text>
        <Text style={styles.xpText}>{xp} XP</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${xpProgress * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {xp % xpToNextLevel} / {xpToNextLevel} XP to next level
        </Text>
      </View>
    </View>
  );
};

// Todo Item Component
const TodoItem = ({ 
  todo, 
  onComplete 
}: { 
  todo: TodoItem; 
  onComplete: (id: string) => void;
}) => (
  <TouchableOpacity
    style={[
      styles.todoItem,
      todo.completed && styles.todoCompleted
    ]}
    onPress={() => !todo.completed && onComplete(todo.id)}
    disabled={todo.completed}
  >
    <View style={styles.todoContent}>
      <View style={styles.todoLeft}>
        <View style={[
          styles.todoCheckbox,
          todo.completed && styles.todoCheckboxCompleted
        ]}>
          {todo.completed && (
            <Ionicons name="checkmark" size={16} color="#ffffff" />
          )}
        </View>
        <Text style={[
          styles.todoText,
          todo.completed && styles.todoTextCompleted
        ]}>
          {todo.text}
        </Text>
      </View>
      <View style={styles.xpReward}>
        <Ionicons name="star" size={16} color="#fbbf24" />
        <Text style={styles.xpRewardText}>{todo.xpReward}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// Quick Actions Component
const QuickActions = () => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Quick Actions</Text>
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.quickAction}>
        <View style={styles.quickActionIcon}>
          <Ionicons name="restaurant" size={24} color="#6366f1" />
        </View>
        <Text style={styles.quickActionText}>Log Meal</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction}>
        <View style={styles.quickActionIcon}>
          <Ionicons name="chatbubbles" size={24} color="#6366f1" />
        </View>
        <Text style={styles.quickActionText}>Chat</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction}>
        <View style={styles.quickActionIcon}>
          <Ionicons name="heart" size={24} color="#6366f1" />
        </View>
        <Text style={styles.quickActionText}>Self-Care</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function HomeScreen() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(7);
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(5);
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Log today\'s meals', completed: false, xpReward: 50 },
    { id: '2', text: 'Practice self-compassion', completed: false, xpReward: 30 },
    { id: '3', text: 'Check in with your feelings', completed: false, xpReward: 40 },
    { id: '4', text: 'Reach out to support network', completed: false, xpReward: 60 },
  ]);

  const xpToNextLevel = 2000;

  const completeTodo = (id: string) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id 
          ? { ...todo, completed: true }
          : todo
      )
    );
    
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setXp(prev => prev + todo.xpReward);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.displayName || 'friend'}!
          </Text>
          <Text style={styles.subtitleText}>
            You're doing amazing in your recovery journey
          </Text>
        </View>

        {/* Streak Card */}
        <StreakCard streak={streak} />

        {/* Level Progress */}
        <LevelProgress 
          level={level} 
          xp={xp} 
          xpToNextLevel={xpToNextLevel} 
        />

        {/* Daily Goals */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Goals</Text>
          <Text style={styles.sectionSubtitle}>Complete these for XP rewards</Text>
          
          {todos.map((todo) => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onComplete={completeTodo}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <QuickActions />

        {/* Encouragement Message */}
        <View style={styles.encouragementCard}>
          <Ionicons name="heart" size={24} color="#ec4899" />
          <Text style={styles.encouragementText}>
            Remember: Every step forward, no matter how small, is progress worth celebrating.
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
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f97316',
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  todoCompleted: {
    opacity: 0.6,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todoCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoCheckboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  todoText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  xpReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpRewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'center',
  },
  encouragementCard: {
    backgroundColor: '#fdf2f8',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
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