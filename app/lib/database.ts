import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  addDoc,
  DocumentData,
  QuerySnapshot,
  Firestore
} from 'firebase/firestore';
import { db } from './firebase';

// Type assertion for db to fix TypeScript errors
const firestoreDb = db as Firestore;

// ============================================================================
// DATA MODELS
// ============================================================================

export interface MealLog {
  id?: string;
  userId: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  timestamp: Timestamp;
  imageUri?: string;
  mood?: 'positive' | 'neutral' | 'challenging' | 'crisis';
  location?: string;
  company?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TriggerLog {
  id?: string;
  userId: string;
  trigger: string;
  severity: number; // 1-10 scale
  timestamp: Timestamp;
  location?: string;
  context?: string;
  copingStrategy?: string;
  effectiveness?: number; // 1-10 scale
  crisisLevel?: 'low' | 'medium' | 'high' | 'crisis';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReflectionLog {
  id?: string;
  userId: string;
  content: string;
  timestamp: Timestamp;
  mood?: 'positive' | 'neutral' | 'challenging' | 'crisis';
  tags?: string[];
  aiResponse?: string;
  insights?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPattern {
  id?: string;
  userId: string;
  type: 'meal' | 'trigger' | 'mood' | 'crisis' | 'reflection';
  data: any;
  severity?: number; // 1-10 scale
  timestamp: Timestamp;
  createdAt: Timestamp;
}

export interface CrisisLog {
  id?: string;
  userId: string;
  severity: number; // 1-10 scale
  timestamp: Timestamp;
  trigger?: string;
  actionTaken?: string;
  supportContacted?: boolean;
  followUpNeeded?: boolean;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserStats {
  userId: string;
  totalMeals: number;
  totalReflections: number;
  totalTriggers: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  lastActive: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// DATABASE SERVICE
// ============================================================================

export class DatabaseService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ============================================================================
  // MEAL LOGGING
  // ============================================================================

  async createMealLog(mealData: Omit<MealLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!firestoreDb) {
        throw new Error('Firestore not initialized');
      }

      const mealLog: Omit<MealLog, 'id'> = {
        ...mealData,
        userId: this.userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(firestoreDb, 'meals'), mealLog);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating meal log:', error);
      
      // Handle offline errors gracefully
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }
      
      throw new Error('Failed to save meal. Please try again.');
    }
  }

  async getMealLogs(limitCount: number = 50): Promise<MealLog[]> {
    try {
      if (!firestoreDb) {
        throw new Error('Firestore not initialized');
      }

      const q = query(
        collection(firestoreDb, 'meals'),
        where('userId', '==', this.userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MealLog[];
    } catch (error: any) {
      console.error('Error getting meal logs:', error);
      
      // Handle offline errors gracefully
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.log('User is offline, returning empty meal logs');
        return []; // Return empty array instead of throwing
      }
      
      throw new Error('Failed to load meal history. Please try again.');
    }
  }

  async updateMealLog(mealId: string, updates: Partial<MealLog>): Promise<void> {
    try {
      const mealRef = doc(firestoreDb, 'meals', mealId);
      await updateDoc(mealRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating meal log:', error);
      throw error;
    }
  }

  async deleteMealLog(mealId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestoreDb, 'meals', mealId));
    } catch (error) {
      console.error('Error deleting meal log:', error);
      throw error;
    }
  }

  // ============================================================================
  // TRIGGER LOGGING
  // ============================================================================

  async createTriggerLog(triggerData: Omit<TriggerLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const triggerLog: Omit<TriggerLog, 'id'> = {
        ...triggerData,
        userId: this.userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(firestoreDb, 'triggers'), triggerLog);
      return docRef.id;
    } catch (error) {
      console.error('Error creating trigger log:', error);
      throw error;
    }
  }

  async getTriggerLogs(limitCount: number = 50): Promise<TriggerLog[]> {
    try {
      const q = query(
        collection(firestoreDb, 'triggers'),
        where('userId', '==', this.userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TriggerLog[];
    } catch (error) {
      console.error('Error getting trigger logs:', error);
      throw error;
    }
  }

  async updateTriggerLog(triggerId: string, updates: Partial<TriggerLog>): Promise<void> {
    try {
      const triggerRef = doc(firestoreDb, 'triggers', triggerId);
      await updateDoc(triggerRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating trigger log:', error);
      throw error;
    }
  }

  // ============================================================================
  // REFLECTION LOGGING
  // ============================================================================

  async createReflectionLog(reflectionData: Omit<ReflectionLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const reflectionLog: Omit<ReflectionLog, 'id'> = {
        ...reflectionData,
        userId: this.userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(firestoreDb, 'reflections'), reflectionLog);
      return docRef.id;
    } catch (error) {
      console.error('Error creating reflection log:', error);
      throw error;
    }
  }

  async getReflectionLogs(limitCount: number = 50): Promise<ReflectionLog[]> {
    try {
      const q = query(
        collection(firestoreDb, 'reflections'),
        where('userId', '==', this.userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReflectionLog[];
    } catch (error) {
      console.error('Error getting reflection logs:', error);
      throw error;
    }
  }

  async updateReflectionLog(reflectionId: string, updates: Partial<ReflectionLog>): Promise<void> {
    try {
      const reflectionRef = doc(firestoreDb, 'reflections', reflectionId);
      await updateDoc(reflectionRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating reflection log:', error);
      throw error;
    }
  }

  // ============================================================================
  // CRISIS LOGGING
  // ============================================================================

  async createCrisisLog(crisisData: Omit<CrisisLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const crisisLog: Omit<CrisisLog, 'id'> = {
        ...crisisData,
        userId: this.userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(firestoreDb, 'crises'), crisisLog);
      return docRef.id;
    } catch (error) {
      console.error('Error creating crisis log:', error);
      throw error;
    }
  }

  async getCrisisLogs(limitCount: number = 20): Promise<CrisisLog[]> {
    try {
      const q = query(
        collection(firestoreDb, 'crises'),
        where('userId', '==', this.userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CrisisLog[];
    } catch (error) {
      console.error('Error getting crisis logs:', error);
      throw error;
    }
  }

  // ============================================================================
  // USER PATTERNS (for predictive engine)
  // ============================================================================

  async createUserPattern(patternData: Omit<UserPattern, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const pattern: Omit<UserPattern, 'id'> = {
        ...patternData,
        userId: this.userId,
        createdAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(firestoreDb, 'patterns'), pattern);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user pattern:', error);
      throw error;
    }
  }

  async getUserPatterns(type?: string, days: number = 7): Promise<UserPattern[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      let q = query(
        collection(firestoreDb, 'patterns'),
        where('userId', '==', this.userId),
        where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
        orderBy('timestamp', 'desc')
      );

      if (type) {
        q = query(q, where('type', '==', type));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserPattern[];
    } catch (error) {
      console.error('Error getting user patterns:', error);
      throw error;
    }
  }

  // ============================================================================
  // USER STATISTICS
  // ============================================================================

  async getUserStats(): Promise<UserStats | null> {
    try {
      const statsDoc = await getDoc(doc(firestoreDb, 'userStats', this.userId));
      if (statsDoc.exists()) {
        return { id: statsDoc.id, ...statsDoc.data() } as UserStats;
      }
      return null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  async createUserStats(statsData: Omit<UserStats, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const stats: Omit<UserStats, 'id'> = {
        ...statsData,
        userId: this.userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(doc(firestoreDb, 'userStats', this.userId), stats);
    } catch (error) {
      console.error('Error creating user stats:', error);
      throw error;
    }
  }

  async updateUserStats(updates: Partial<UserStats>): Promise<void> {
    try {
      const statsRef = doc(firestoreDb, 'userStats', this.userId);
      await updateDoc(statsRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS & INSIGHTS
  // ============================================================================

  async getMealAnalytics(days: number = 30): Promise<any> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const q = query(
        collection(firestoreDb, 'meals'),
        where('userId', '==', this.userId),
        where('timestamp', '>=', Timestamp.fromDate(cutoffDate))
      );

      const querySnapshot = await getDocs(q);
      const meals = querySnapshot.docs.map(doc => doc.data()) as MealLog[];

      // Calculate analytics
      const mealTypes = meals.reduce((acc, meal) => {
        acc[meal.type] = (acc[meal.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const moodDistribution = meals.reduce((acc, meal) => {
        if (meal.mood) {
          acc[meal.mood] = (acc[meal.mood] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        totalMeals: meals.length,
        mealTypes,
        moodDistribution,
        averageMealsPerDay: meals.length / days,
        lastMeal: meals.length > 0 ? meals[0].timestamp : null
      };
    } catch (error) {
      console.error('Error getting meal analytics:', error);
      throw error;
    }
  }

  async getTriggerAnalytics(days: number = 30): Promise<any> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const q = query(
        collection(firestoreDb, 'triggers'),
        where('userId', '==', this.userId),
        where('timestamp', '>=', Timestamp.fromDate(cutoffDate))
      );

      const querySnapshot = await getDocs(q);
      const triggers = querySnapshot.docs.map(doc => doc.data()) as TriggerLog[];

      const averageSeverity = triggers.length > 0 
        ? triggers.reduce((sum, trigger) => sum + trigger.severity, 0) / triggers.length 
        : 0;

      const severityDistribution = triggers.reduce((acc, trigger) => {
        const level = trigger.severity <= 3 ? 'low' : 
                     trigger.severity <= 6 ? 'medium' : 
                     trigger.severity <= 8 ? 'high' : 'crisis';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalTriggers: triggers.length,
        averageSeverity,
        severityDistribution,
        triggersPerDay: triggers.length / days,
        lastTrigger: triggers.length > 0 ? triggers[0].timestamp : null
      };
    } catch (error) {
      console.error('Error getting trigger analytics:', error);
      throw error;
    }
  }

  // ============================================================================
  // DATA EXPORT
  // ============================================================================

  async exportUserData(): Promise<any> {
    try {
      const [meals, triggers, reflections, crises, patterns, stats] = await Promise.all([
        this.getMealLogs(1000),
        this.getTriggerLogs(1000),
        this.getReflectionLogs(1000),
        this.getCrisisLogs(1000),
        this.getUserPatterns(undefined, 365),
        this.getUserStats()
      ]);

      return {
        exportDate: new Date().toISOString(),
        user: {
          userId: this.userId,
          stats
        },
        data: {
          meals,
          triggers,
          reflections,
          crises,
          patterns
        }
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // ============================================================================
  // DATA CLEANUP
  // ============================================================================

  async deleteAllUserData(): Promise<void> {
    try {
      // Get all collections for this user
      const collections = ['meals', 'triggers', 'reflections', 'crises', 'patterns', 'userStats'];
      
      for (const collectionName of collections) {
        const q = query(
          collection(firestoreDb, collectionName),
          where('userId', '==', this.userId)
        );
        
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const createDatabaseService = (userId: string): DatabaseService => {
  return new DatabaseService(userId);
}; 