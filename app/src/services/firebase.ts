import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { 
  UserProfile, 
  JournalEntry, 
  MealLog, 
  BehaviorLog, 
  ModuleProgress,
  Insight 
} from '../types';

// User Profile Operations
export const createUserProfile = async (userId: string, profile: Omit<UserProfile, 'id'>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ...profile, id: userId });
    return userId;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Journal Entry Operations
export const createJournalEntry = async (entry: Omit<JournalEntry, 'id'>) => {
  try {
    const entriesRef = collection(db, 'journalEntries');
    const docRef = await addDoc(entriesRef, {
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

export const getUserJournalEntries = async (userId: string, limitCount = 50): Promise<JournalEntry[]> => {
  try {
    const entriesRef = collection(db, 'journalEntries');
    const q = query(
      entriesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JournalEntry[];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw error;
  }
};

export const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntry>) => {
  try {
    const entryRef = doc(db, 'journalEntries', entryId);
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

// Meal Log Operations - Updated for new structure
export const createMealLog = async (mealLog: Omit<MealLog, 'id' | 'createdAt'> & { timestamp?: Date }) => {
  try {
    const mealsRef = collection(db, 'mealLogs');
    const { timestamp, ...mealLogData } = mealLog;
    const docRef = await addDoc(mealsRef, {
      ...mealLogData,
      createdAt: timestamp ? timestamp.toISOString() : new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating meal log:', error);
    throw error;
  }
};

export const getUserMealLogs = async (userId: string, limitCount = 50): Promise<MealLog[]> => {
  try {
    const mealsRef = collection(db, 'mealLogs');
    const q = query(
      mealsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MealLog[];
  } catch (error) {
    console.error('Error getting meal logs:', error);
    throw error;
  }
};

export const updateMealLog = async (mealLogId: string, updates: Partial<MealLog>) => {
  try {
    const mealRef = doc(db, 'mealLogs', mealLogId);
    await updateDoc(mealRef, updates);
  } catch (error) {
    console.error('Error updating meal log:', error);
    throw error;
  }
};

// Behavior Log Operations - Updated for new structure
export const createBehaviorLog = async (behaviorLog: Omit<BehaviorLog, 'id' | 'createdAt'> & { timestamp?: Date }) => {
  try {
    const behaviorsRef = collection(db, 'behaviorLogs');
    const { timestamp, ...behaviorLogData } = behaviorLog;
    const docRef = await addDoc(behaviorsRef, {
      ...behaviorLogData,
      createdAt: timestamp ? timestamp.toISOString() : new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating behavior log:', error);
    throw error;
  }
};

export const getUserBehaviorLogs = async (userId: string, limitCount = 50): Promise<BehaviorLog[]> => {
  try {
    const behaviorsRef = collection(db, 'behaviorLogs');
    const q = query(
      behaviorsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BehaviorLog[];
  } catch (error) {
    console.error('Error getting behavior logs:', error);
    throw error;
  }
};

export const updateBehaviorLog = async (behaviorLogId: string, updates: Partial<BehaviorLog>) => {
  try {
    const behaviorRef = doc(db, 'behaviorLogs', behaviorLogId);
    await updateDoc(behaviorRef, updates);
  } catch (error) {
    console.error('Error updating behavior log:', error);
    throw error;
  }
};

// Module Progress Operations
export const getUserModuleProgress = async (userId: string): Promise<ModuleProgress[]> => {
  try {
    const progressRef = collection(db, 'moduleProgress');
    const q = query(progressRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data()
    })) as ModuleProgress[];
  } catch (error) {
    console.error('Error getting module progress:', error);
    throw error;
  }
};

export const updateModuleProgress = async (userId: string, moduleId: string, updates: Partial<ModuleProgress>) => {
  try {
    const progressRef = collection(db, 'moduleProgress');
    const q = query(
      progressRef, 
      where('userId', '==', userId),
      where('moduleId', '==', moduleId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, updates);
    } else {
      // Create new progress entry
      await addDoc(progressRef, {
        userId,
        moduleId,
        ...updates
      });
    }
  } catch (error) {
    console.error('Error updating module progress:', error);
    throw error;
  }
};

// Insights Operations
export const getUserInsights = async (userId: string): Promise<Insight[]> => {
  try {
    const insightsRef = collection(db, 'insights');
    const q = query(
      insightsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Insight[];
  } catch (error) {
    console.error('Error getting insights:', error);
    throw error;
  }
};

export const createInsight = async (insight: Omit<Insight, 'id'>) => {
  try {
    const insightsRef = collection(db, 'insights');
    const docRef = await addDoc(insightsRef, {
      ...insight,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating insight:', error);
    throw error;
  }
}; 