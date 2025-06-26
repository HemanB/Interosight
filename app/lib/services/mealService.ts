import AsyncStorage from '@react-native-async-storage/async-storage';

// Meal and trigger interfaces
export interface MealLog {
  id: string;
  userId: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TriggerLog {
  id: string;
  userId: string;
  trigger: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  notes?: string;
  copingStrategies?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MealStats {
  totalMeals: number;
  mealsThisWeek: number;
  streakDays: number;
  lastMealDate?: Date;
}

export interface TriggerStats {
  totalTriggers: number;
  triggersThisWeek: number;
  averageSeverity: number;
  lastTriggerDate?: Date;
}

// Meal service class
export class MealService {
  private readonly MEAL_STORAGE_KEY = 'mealLogs';
  private readonly TRIGGER_STORAGE_KEY = 'triggerLogs';

  // Meal operations
  async getMeals(userId: string, limit: number = 20): Promise<MealLog[]> {
    try {
      const storedLogs = await AsyncStorage.getItem(`${this.MEAL_STORAGE_KEY}_${userId}`);
      if (storedLogs) {
        const logs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          createdAt: new Date(log.createdAt),
          updatedAt: new Date(log.updatedAt)
        }));
        return logs.slice(-limit);
      }
      return [];
    } catch (error) {
      console.error('MealService: Error getting meals:', error);
      throw new Error('Failed to load meals');
    }
  }

  async saveMeal(userId: string, meal: Omit<MealLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<MealLog> {
    try {
      const newMeal: MealLog = {
        id: Date.now().toString(),
        userId,
        ...meal,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const existingLogs = await this.getMeals(userId, 1000); // Get all meals
      const updatedLogs = [...existingLogs, newMeal];
      
      await AsyncStorage.setItem(`${this.MEAL_STORAGE_KEY}_${userId}`, JSON.stringify(updatedLogs));
      
      console.log('MealService: Meal saved successfully');
      return newMeal;
    } catch (error) {
      console.error('MealService: Error saving meal:', error);
      throw new Error('Failed to save meal');
    }
  }

  async deleteMeal(userId: string, mealId: string): Promise<void> {
    try {
      const existingLogs = await this.getMeals(userId, 1000);
      const updatedLogs = existingLogs.filter(meal => meal.id !== mealId);
      
      await AsyncStorage.setItem(`${this.MEAL_STORAGE_KEY}_${userId}`, JSON.stringify(updatedLogs));
      
      console.log('MealService: Meal deleted successfully');
    } catch (error) {
      console.error('MealService: Error deleting meal:', error);
      throw new Error('Failed to delete meal');
    }
  }

  async getMealStats(userId: string): Promise<MealStats> {
    try {
      const meals = await this.getMeals(userId, 1000);
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const mealsThisWeek = meals.filter(meal => meal.timestamp >= oneWeekAgo).length;
      const lastMeal = meals.length > 0 ? meals[meals.length - 1] : null;
      
      // Calculate streak (simplified - consecutive days with meals)
      let streakDays = 0;
      if (meals.length > 0) {
        const sortedMeals = meals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < sortedMeals.length; i++) {
          const mealDate = new Date(sortedMeals[i].timestamp);
          mealDate.setHours(0, 0, 0, 0);
          
          if (mealDate.getTime() === today.getTime() - (i * 24 * 60 * 60 * 1000)) {
            streakDays++;
          } else {
            break;
          }
        }
      }

      return {
        totalMeals: meals.length,
        mealsThisWeek,
        streakDays,
        lastMealDate: lastMeal?.timestamp
      };
    } catch (error) {
      console.error('MealService: Error getting meal stats:', error);
      throw new Error('Failed to get meal statistics');
    }
  }

  // Trigger operations
  async getTriggers(userId: string, limit: number = 20): Promise<TriggerLog[]> {
    try {
      const storedLogs = await AsyncStorage.getItem(`${this.TRIGGER_STORAGE_KEY}_${userId}`);
      if (storedLogs) {
        const logs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          createdAt: new Date(log.createdAt),
          updatedAt: new Date(log.updatedAt)
        }));
        return logs.slice(-limit);
      }
      return [];
    } catch (error) {
      console.error('MealService: Error getting triggers:', error);
      throw new Error('Failed to load triggers');
    }
  }

  async saveTrigger(userId: string, trigger: Omit<TriggerLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<TriggerLog> {
    try {
      const newTrigger: TriggerLog = {
        id: Date.now().toString(),
        userId,
        ...trigger,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const existingLogs = await this.getTriggers(userId, 1000);
      const updatedLogs = [...existingLogs, newTrigger];
      
      await AsyncStorage.setItem(`${this.TRIGGER_STORAGE_KEY}_${userId}`, JSON.stringify(updatedLogs));
      
      console.log('MealService: Trigger saved successfully');
      return newTrigger;
    } catch (error) {
      console.error('MealService: Error saving trigger:', error);
      throw new Error('Failed to save trigger');
    }
  }

  async deleteTrigger(userId: string, triggerId: string): Promise<void> {
    try {
      const existingLogs = await this.getTriggers(userId, 1000);
      const updatedLogs = existingLogs.filter(trigger => trigger.id !== triggerId);
      
      await AsyncStorage.setItem(`${this.TRIGGER_STORAGE_KEY}_${userId}`, JSON.stringify(updatedLogs));
      
      console.log('MealService: Trigger deleted successfully');
    } catch (error) {
      console.error('MealService: Error deleting trigger:', error);
      throw new Error('Failed to delete trigger');
    }
  }

  async getTriggerStats(userId: string): Promise<TriggerStats> {
    try {
      const triggers = await this.getTriggers(userId, 1000);
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const triggersThisWeek = triggers.filter(trigger => trigger.timestamp >= oneWeekAgo).length;
      const lastTrigger = triggers.length > 0 ? triggers[triggers.length - 1] : null;
      
      // Calculate average severity
      const severityMap = { low: 1, medium: 2, high: 3 };
      const totalSeverity = triggers.reduce((sum, trigger) => sum + severityMap[trigger.severity], 0);
      const averageSeverity = triggers.length > 0 ? totalSeverity / triggers.length : 0;

      return {
        totalTriggers: triggers.length,
        triggersThisWeek,
        averageSeverity,
        lastTriggerDate: lastTrigger?.timestamp
      };
    } catch (error) {
      console.error('MealService: Error getting trigger stats:', error);
      throw new Error('Failed to get trigger statistics');
    }
  }

  // Combined operations
  async clearAllData(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.MEAL_STORAGE_KEY}_${userId}`);
      await AsyncStorage.removeItem(`${this.TRIGGER_STORAGE_KEY}_${userId}`);
      console.log('MealService: All meal and trigger data cleared');
    } catch (error) {
      console.error('MealService: Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  }
}

// Export singleton instance
export const mealService = new MealService(); 