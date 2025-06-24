import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';
import NetworkStatus from '../components/NetworkStatus';
import { useAuth } from '../contexts/AuthContext';
import { createDatabaseService, MealLog } from '../lib/database';
import { Timestamp } from 'firebase/firestore';

export default function MealsScreen() {
  const { user } = useAuth();
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [description, setDescription] = useState<string>('');
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [mascotMood, setMascotMood] = useState<'happy' | 'supportive' | 'celebrating'>('happy');
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | undefined>(undefined);

  const dbService = user ? createDatabaseService(user.uid) : null;

  // Load meal logs on component mount
  useEffect(() => {
    if (dbService) {
      loadMealLogs();
    }
  }, [dbService]);

  const loadMealLogs = async () => {
    if (!dbService) return;
    
    try {
      setIsLoading(true);
      setNetworkError(undefined);
      const logs = await dbService.getMealLogs(20); // Get last 20 meals
      setMealLogs(logs);
    } catch (error: any) {
      console.error('Error loading meal logs:', error);
      if (error.message?.includes('offline') || error.message?.includes('internet')) {
        setNetworkError('Unable to load meals - check your connection');
      } else {
        Alert.alert('Error', 'Failed to load your meal history.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveMeal = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please describe your meal to continue.');
      return;
    }

    if (!dbService) {
      Alert.alert('Error', 'Please log in to save meals.');
      return;
    }

    try {
      setIsLoading(true);
      
      const newMeal: Omit<MealLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        type: selectedMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        description: description.trim(),
        timestamp: Timestamp.now(),
      };

      await dbService.createMealLog(newMeal);
      
      // Reload meal logs to show the new entry
      await loadMealLogs();
      
      setDescription('');
      setMascotMood('celebrating');
      
      setTimeout(() => {
        setMascotMood('happy');
        Alert.alert(
          'Meal Logged!',
          'Great job taking care of yourself. Every meal is a step toward healing.',
          [{ text: 'Thank you', style: 'default' }]
        );
      }, 2000);
    } catch (error: any) {
      console.error('Error saving meal:', error);
      
      // Show specific error messages for different scenarios
      if (error.message?.includes('offline') || error.message?.includes('internet')) {
        Alert.alert(
          'Connection Issue',
          'You appear to be offline. Please check your internet connection and try again.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to save your meal. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return '#fbbf24';
      case 'lunch': return '#10b981';
      case 'dinner': return '#6366f1';
      case 'snack': return '#ec4899';
      default: return '#6366f1';
    }
  };

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return 'sunny';
      case 'lunch': return 'restaurant';
      case 'dinner': return 'moon';
      case 'snack': return 'cafe';
      default: return 'restaurant';
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Network Status */}
        <NetworkStatus />
        
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood={mascotMood} size={80} />
          <Text style={styles.headerTitle}>Meal Logging</Text>
          <Text style={styles.headerSubtitle}>
            Log your meals with kindness and compassion
          </Text>
        </View>

        {/* Meal Type Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What type of meal?</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map((mealType) => (
              <TouchableOpacity
                key={mealType.key}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === mealType.key && styles.mealTypeButtonSelected,
                  { borderColor: getMealTypeColor(mealType.key) }
                ]}
                onPress={() => setSelectedMealType(mealType.key)}
              >
                <Ionicons
                  name={mealType.icon as any}
                  size={24}
                  color={selectedMealType === mealType.key ? '#ffffff' : getMealTypeColor(mealType.key)}
                />
                <Text style={[
                  styles.mealTypeText,
                  selectedMealType === mealType.key && styles.mealTypeTextSelected
                ]}>
                  {mealType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Describe your meal</Text>
          <Text style={styles.sectionSubtitle}>
            Focus on what you enjoyed, how it tasted, or how it made you feel
          </Text>
          
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., 'I had a warm bowl of oatmeal with berries. It felt comforting and gave me energy for the day.'"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          
          <Text style={styles.characterCount}>
            {description.length}/500 characters
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!description.trim() || isLoading) && styles.saveButtonDisabled
          ]}
          onPress={saveMeal}
          disabled={!description.trim() || isLoading}
        >
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Log This Meal'}
          </Text>
        </TouchableOpacity>

        {/* Recent Meals */}
        {mealLogs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recent Meals</Text>
            {mealLogs.slice(0, 5).map((meal) => (
              <View key={meal.id} style={styles.mealLogItem}>
                <View style={styles.mealLogHeader}>
                  <View style={styles.mealLogType}>
                    <Ionicons
                      name={getMealTypeIcon(meal.type) as any}
                      size={16}
                      color={getMealTypeColor(meal.type)}
                    />
                    <Text style={styles.mealLogTypeText}>
                      {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.mealLogTime}>
                    {formatTime(meal.timestamp)}
                  </Text>
                </View>
                <Text style={styles.mealLogDescription}>
                  {meal.description}
                </Text>
                <Text style={styles.mealLogDate}>
                  {formatDate(meal.timestamp)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="heart" size={24} color="#ec4899" />
          <Text style={styles.encouragementText}>
            Remember: There's no "perfect" way to eat. Every meal is nourishment for your body and mind.
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
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealTypeButton: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  mealTypeButtonSelected: {
    backgroundColor: '#6366f1',
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 8,
  },
  mealTypeTextSelected: {
    color: '#ffffff',
  },
  descriptionInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
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
  mealLogItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mealLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealLogType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealLogTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginLeft: 6,
  },
  mealLogTime: {
    fontSize: 12,
    color: '#64748b',
  },
  mealLogDescription: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 8,
  },
  mealLogDate: {
    fontSize: 12,
    color: '#9ca3af',
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

const mealTypes = [
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny' },
  { key: 'lunch', label: 'Lunch', icon: 'restaurant' },
  { key: 'dinner', label: 'Dinner', icon: 'moon' },
  { key: 'snack', label: 'Snack', icon: 'cafe' },
] as const; 