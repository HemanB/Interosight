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
import { NetworkStatus } from '../components/NetworkStatus';
import { useAuth } from '../contexts/AuthContext';
import { mealService, MealLog } from '../lib/services/mealService';
import { MealValidation } from '../lib/validation/mealValidation';
import { DateUtils } from '../lib/utils/dateUtils';
import { MEAL_TYPES, MealTypeUtils, MEAL_PROMPTS } from '../lib/constants/mealTypes';

export default function MealsScreen() {
  const { user } = useAuth();
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [description, setDescription] = useState<string>('');
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [mascotMood, setMascotMood] = useState<'happy' | 'supportive' | 'celebrating'>('happy');
  const [isLoading, setIsLoading] = useState(false);

  // Load meal logs on component mount
  useEffect(() => {
    if (user) {
      loadMealLogs();
    }
  }, [user]);

  const loadMealLogs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const logs = await mealService.getMeals(user.id, 20);
      setMealLogs(logs);
    } catch (error: any) {
      console.error('Error loading meal logs:', error);
      Alert.alert('Error', 'Failed to load your meal history.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveMeal = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to save meals.');
      return;
    }

    // Validate meal data
    const mealData = {
      type: selectedMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      description: description.trim()
    };

    const validation = MealValidation.validateMeal(mealData);
    if (!validation.isValid) {
      const errorMessage = MealValidation.getMealErrorMessage(validation);
      Alert.alert('Validation Error', errorMessage);
      return;
    }

    try {
      setIsLoading(true);
      
      const sanitizedData = MealValidation.sanitizeMealData(mealData);
      const newMeal = await mealService.saveMeal(user.id, {
        ...sanitizedData,
        timestamp: new Date()
      });
      
      // Add to local state
      setMealLogs(prev => [newMeal, ...prev.slice(0, 19)]); // Keep only last 20
      
      setDescription('');
      setMascotMood('celebrating');
      
      setTimeout(() => {
        setMascotMood('happy');
        Alert.alert(
          'Meal Logged!',
          MEAL_PROMPTS.success,
          [{ text: 'Thank you', style: 'default' }]
        );
      }, 2000);
    } catch (error: any) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save your meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMealTypeColor = (type: string) => {
    return MealTypeUtils.getMealTypeColor(type);
  };

  const getMealTypeIcon = (type: string) => {
    return MealTypeUtils.getMealTypeIcon(type);
  };

  const formatTime = (timestamp: Date) => {
    return DateUtils.formatTime(timestamp);
  };

  const formatDate = (timestamp: Date) => {
    return DateUtils.formatDate(timestamp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Network Status */}
        <NetworkStatus isOnline={true} error={undefined} />
        
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood={mascotMood} size={80} />
          <Text style={styles.headerTitle}>Meal Logging</Text>
          <Text style={styles.headerSubtitle}>
            {MEAL_PROMPTS.description}
          </Text>
        </View>

        {/* Meal Type Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What type of meal?</Text>
          <View style={styles.mealTypeContainer}>
            {MEAL_TYPES.map((mealType) => (
              <TouchableOpacity
                key={mealType.key}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === mealType.key && styles.mealTypeButtonSelected,
                  { borderColor: mealType.color }
                ]}
                onPress={() => setSelectedMealType(mealType.key)}
              >
                <Ionicons
                  name={mealType.icon as any}
                  size={24}
                  color={selectedMealType === mealType.key ? '#ffffff' : mealType.color}
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
            {MEAL_PROMPTS.description}
          </Text>
          
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="What did you eat? How did it taste? How did it make you feel?"
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={saveMeal}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Log Meal'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Meal History */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Meals</Text>
          {mealLogs.length === 0 ? (
            <Text style={styles.emptyText}>No meals logged yet. Start by logging your first meal above!</Text>
          ) : (
            mealLogs.map((meal) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealTypeInfo}>
                    <Ionicons
                      name={getMealTypeIcon(meal.type) as any}
                      size={16}
                      color={getMealTypeColor(meal.type)}
                    />
                    <Text style={styles.mealTypeLabel}>
                      {MealTypeUtils.getMealTypeLabel(meal.type)}
                    </Text>
                  </View>
                  <Text style={styles.mealTime}>
                    {formatTime(meal.timestamp)}
                  </Text>
                </View>
                <Text style={styles.mealDescription}>{meal.description}</Text>
                <Text style={styles.mealDate}>{formatDate(meal.timestamp)}</Text>
              </View>
            ))
          )}
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
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mealItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginLeft: 6,
  },
  mealTime: {
    fontSize: 12,
    color: '#64748b',
  },
  mealDescription: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 8,
  },
  mealDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
}); 