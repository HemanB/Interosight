import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  where,
  FieldValue,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateEntrySummary } from './googleAIService';
import type { JournalEntry, ModuleProgress, DiscardedPrompt, Module, Submodule } from '../types';

// User Profile Functions
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  age?: number;
  gender?: string;
  recoveryStage?: 'early' | 'maintenance' | 'advanced';
  createdAt: string;
  lastActive: string;
  preferences: {
    notifications: {
      email: boolean;
      reflection: boolean;
      encouragement: boolean;
    };
    privacy: {
      dataSharing: boolean;
      analytics: boolean;
    };
    ui: {
      theme: 'light' | 'dark';
      textSize: 'small' | 'medium' | 'large';
    };
  };
  privacySettings: {
    dataProcessing: boolean;
    thirdPartySharing: boolean;
    marketingEmails: boolean;
    researchParticipation: boolean;
  };
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error loading user profile:', error);
    throw error;
  }
};

// Module Progress Functions
export const loadModuleProgress = async (userId: string, moduleId: string): Promise<ModuleProgress | null> => {
  try {
    // First try to get the progress document
    const progressRef = doc(db, 'users', userId, 'module_progress', moduleId);
    const progressDoc = await getDoc(progressRef);
    
    // If no progress document exists, create it with default values
    if (!progressDoc.exists()) {
      const defaultProgress: ModuleProgress = {
        submodules: {},
        lastAccessed: Timestamp.now(),
        unlockedAt: moduleId === 'introduction' ? Timestamp.now() : undefined
      };
      
      await setDoc(progressRef, defaultProgress);
      return defaultProgress;
    }
    
    return progressDoc.data() as ModuleProgress;
  } catch (error) {
    console.error('Error loading module progress:', error);
    throw error;
  }
};

export const updateModuleProgress = async (
  userId: string,
  moduleId: string,
  submoduleId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  currentPosition: number
): Promise<void> => {
  try {
    const progressRef = doc(db, 'users', userId, 'module_progress', moduleId);
    const progressDoc = await getDoc(progressRef);
    
    const now = Timestamp.now();
    
    if (!progressDoc.exists()) {
      // Create new progress document with initial state
      const newProgress: ModuleProgress = {
        submodules: {
          [submoduleId]: {
            status,
            currentPosition,
            ...(status === 'completed' ? { completedAt: now } : {})
          }
        },
        lastAccessed: now,
        unlockedAt: moduleId === 'introduction' ? now : undefined
      };
      
      await setDoc(progressRef, newProgress);
    } else {
      // Update existing progress
      const currentProgress = progressDoc.data() as ModuleProgress;
      const updatedProgress: ModuleProgress = {
        ...currentProgress,
        submodules: {
          ...currentProgress.submodules,
          [submoduleId]: {
            status,
            currentPosition,
            ...(status === 'completed' ? { completedAt: now } : {})
          }
        },
        lastAccessed: now,
        unlockedAt: currentProgress.unlockedAt || (moduleId === 'introduction' ? now : undefined)
      };
      
      await setDoc(progressRef, updatedProgress);
      
      // If this module is completed, unlock the next module
      if (status === 'completed' && 
          Object.values(updatedProgress.submodules).every(sub => sub.status === 'completed')) {
        await unlockNextModule(userId, moduleId);
      }
    }
  } catch (error) {
    console.error('Error updating module progress:', error);
    throw error;
  }
};

// Helper function to unlock the next module
const unlockNextModule = async (userId: string, currentModuleId: string): Promise<void> => {
  try {
    const modules = getAllModules();
    const currentIndex = modules.findIndex((m: Module) => m.id === currentModuleId);
    
    // If there's a next module, unlock it
    if (currentIndex >= 0 && currentIndex < modules.length - 1) {
      const nextModule = modules[currentIndex + 1];
      const nextModuleRef = doc(db, 'users', userId, 'module_progress', nextModule.id);
      
      // Create or update the next module's progress document
      await setDoc(nextModuleRef, {
        submodules: {},
        lastAccessed: Timestamp.now(),
        unlockedAt: Timestamp.now()
      }, { merge: true }); // Use merge to preserve any existing data
    }
  } catch (error) {
    console.error('Error unlocking next module:', error);
    // Don't throw here - we don't want to break the main progress update if this fails
  }
};

// Journal Entry Functions
export const loadSubmoduleEntries = async (
  userId: string,
  moduleId: string,
  submoduleId: string
): Promise<JournalEntry[]> => {
  try {
    const entriesRef = collection(db, 'users', userId, 'modules', moduleId, 'submodules', submoduleId, 'entries');
    const q = query(
      entriesRef,
      where('isDeleted', '==', false),
      orderBy('chainPosition', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JournalEntry[];
  } catch (error) {
    console.error('Error loading submodule entries:', error);
    throw error;
  }
};

export const createModuleEntry = async (
  userId: string,
  content: string,
  moduleId: string,
  submoduleId: string,
  chainPosition: number = 1,
  parentEntryId?: string
): Promise<string> => {
  try {
    const entryRef = collection(db, 'users', userId, 'modules', moduleId, 'submodules', submoduleId, 'entries');
    
    const entry: Omit<JournalEntry, 'id'> = {
      content,
      wordCount: calculateWordCount(content),
      type: 'module_journal',
      moduleId,
      submoduleId,
      chainPosition,
      parentEntryId,
      isAIPrompt: false,
      isEdited: false,
      trainingDataPreserved: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false
    };
    
    const docRef = await addDoc(entryRef, entry);
    
    // Update parent entry's childEntryIds if this is a response to an AI prompt
    if (parentEntryId) {
      const parentRef = doc(db, 'users', userId, 'modules', moduleId, 'submodules', submoduleId, 'entries', parentEntryId);
      await updateDoc(parentRef, {
        childEntryIds: [docRef.id]
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating module entry:', error);
    throw error;
  }
};

// AI Prompt Functions
export const createAIPromptEntry = async (
  userId: string,
  content: string,
  moduleId: string,
  submoduleId: string,
  context: {
    originalPrompt: string;
    userResponse: string;
    shuffleCount: number;
    parentEntryId: string;
    chainPosition: number;
  }
): Promise<string> => {
  try {
    const entryRef = collection(db, 'users', userId, 'modules', moduleId, 'submodules', submoduleId, 'entries');
    
    const entry: Omit<JournalEntry, 'id'> = {
      content,
      wordCount: calculateWordCount(content),
      type: 'module_journal',
      moduleId,
      submoduleId,
      chainPosition: context.chainPosition,
      parentEntryId: context.parentEntryId,
      isAIPrompt: true,
      isEdited: false,
      trainingDataPreserved: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false
    };
    
    const docRef = await addDoc(entryRef, entry);
    
    // Update parent entry's childEntryIds
    const parentRef = doc(db, 'users', userId, 'modules', moduleId, 'submodules', submoduleId, 'entries', context.parentEntryId);
    await updateDoc(parentRef, {
      childEntryIds: [docRef.id]
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating AI prompt entry:', error);
    throw error;
  }
};

export const trackDiscardedPrompt = async (
  userId: string,
  moduleId: string,
  submoduleId: string,
  discardedPrompt: string,
  context: {
    originalPrompt: string;
    userResponse: string;
    shuffleCount: number;
    reason: 'shuffle' | 'timeout';
    chainPosition: number;
    parentEntryId: string;
  }
): Promise<void> => {
  try {
    const discardedRef = collection(db, 'users', userId, 'modules', moduleId, 'submodules', submoduleId, 'discarded');
    
    const entry: Omit<DiscardedPrompt, 'id'> = {
      discardedPrompt,
      originalPrompt: context.originalPrompt,
      userResponse: context.userResponse,
      shuffleCount: context.shuffleCount,
      reason: context.reason,
      chainPosition: context.chainPosition,
      parentEntryId: context.parentEntryId,
      timestamp: Timestamp.now(),
      promptFeatures: {
        emotionalIntensity: calculateEmotionalIntensity(discardedPrompt),
        personalizationLevel: calculatePersonalizationLevel(discardedPrompt),
        questionType: determineQuestionType(discardedPrompt)
      }
    };
    
    await addDoc(discardedRef, entry);
  } catch (error) {
    console.error('Error tracking discarded prompt:', error);
    throw error;
  }
};

// Freeform Journal Functions
export const createFreeformEntry = async (userId: string, content: string): Promise<string> => {
  try {
    const entryRef = collection(db, 'users', userId, 'journal_entries');
    
    const entry = {
      content,
      wordCount: calculateWordCount(content),
      type: 'freeform',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isEdited: false,
      editHistory: [],
      isDeleted: false
    };
    
    const docRef = await addDoc(entryRef, entry);
    return docRef.id;
  } catch (error) {
    console.error('Error creating freeform entry:', error);
    throw error;
  }
};

// Journal Entry Loading
export const loadUserEntries = async (userId: string): Promise<JournalEntry[]> => {
  try {
    const entriesRef = collection(db, 'users', userId, 'journal_entries');
    const q = query(
      entriesRef,
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JournalEntry[];
  } catch (error) {
    console.error('Error loading user entries:', error);
    throw error;
  }
};

// Validation Functions
export const validateJournalEntry = (content: string): string[] => {
  const errors: string[] = [];
  
  if (!content.trim()) {
    errors.push('Entry cannot be empty');
  }
  
  if (content.length > 50000) {
    errors.push('Entry is too long (maximum 50,000 characters)');
  }
  
  return errors;
};

// Helper Functions
export const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).length;
};

const calculateEmotionalIntensity = (text: string): number => {
  // Simple implementation - can be enhanced with NLP
  const emotionalWords = /(feel|think|believe|wonder|consider|emotion|happy|sad|angry|frustrated|excited|worried|anxious|content|peaceful)/gi;
  const matches = text.match(emotionalWords) || [];
  return Math.min(matches.length / 10, 1); // 0-1 scale
};

const calculatePersonalizationLevel = (text: string): number => {
  // Simple implementation - can be enhanced with NLP
  const personalWords = /(you|your|yourself|we|our|us|together)/gi;
  const matches = text.match(personalWords) || [];
  return Math.min(matches.length / 5, 1); // 0-1 scale
};

const determineQuestionType = (text: string): string => {
  // Simple implementation - can be enhanced with NLP
  if (/(how|what|why|when|where|who)/i.test(text)) {
    if (/feel|emotion|think/i.test(text)) return 'emotional_exploration';
    if (/specific|example|instance/i.test(text)) return 'specific_example';
    if (/future|plan|goal|hope/i.test(text)) return 'future_oriented';
    return 'general_inquiry';
  }
  return 'statement';
}; 

// Meal Log Functions
export interface MealLog {
  userId: string;
  mealType: 'Breakfast' | 'Morning Snack' | 'Lunch' | 'Afternoon Snack' | 'Dinner' | 'Evening Snack' | 'Late Night';
  description: string;
  satietyPre: number;
  satietyPost: number;
  emotionPre: string[];
  emotionPost: string[];
  affectPre: number;
  affectPost: number;
  socialContext: 'Alone' | 'With family' | 'With friends' | 'With colleagues' | 'In a room with others' | 'On video call';
  locationContext: 'Home' | 'Work' | 'School' | 'Restaurant' | 'Cafeteria' | 'Bedroom' | 'Kitchen' | 'Car' | 'Other';
  wordCount: number;
}

export const createMealLog = async (log: MealLog): Promise<string> => {
  try {
    const logRef = collection(db, 'users', log.userId, 'meal_logs');
    
    // Generate summary for the meal log
    let llmSummary = '';
    try {
      llmSummary = await generateEntrySummary({
        content: log.description,
        entryType: 'meal',
        metadata: {
          mealType: log.mealType,
          location: log.locationContext,
          socialContext: log.socialContext,
          satietyPre: log.satietyPre,
          satietyPost: log.satietyPost,
          emotionPre: log.emotionPre,
          emotionPost: log.emotionPost,
          affectPre: log.affectPre,
          affectPost: log.affectPost
        }
      });
    } catch (error) {
      console.error('Error generating summary for meal log:', error);
      // Fallback to simple summary
      llmSummary = log.description.length > 100 ? log.description.substring(0, 100) + '...' : log.description;
    }
    
    const entry = {
      ...log,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false,
      llmSummary
    };
    
    const docRef = await addDoc(logRef, entry);
    return docRef.id;
  } catch (error) {
    console.error('Error creating meal log:', error);
    throw error;
  }
};

// Behavior Log Functions
export interface BehaviorLog {
  userId: string;
  description: string;
  emotionPre: string[];
  emotionPost: string[];
  affectPre: number;
  affectPost: number;
  wordCount: number;
}

export const createBehaviorLog = async (log: BehaviorLog): Promise<string> => {
  try {
    const logRef = collection(db, 'users', log.userId, 'behavior_logs');
    
    // Generate summary for the behavior log
    let llmSummary = '';
    try {
      llmSummary = await generateEntrySummary({
        content: log.description,
        entryType: 'behavior',
        metadata: {
          emotionPre: log.emotionPre,
          emotionPost: log.emotionPost,
          affectPre: log.affectPre,
          affectPost: log.affectPost
        }
      });
    } catch (error) {
      console.error('Error generating summary for behavior log:', error);
      // Fallback to simple summary
      llmSummary = log.description.length > 100 ? log.description.substring(0, 100) + '...' : log.description;
    }
    
    const entry = {
      ...log,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isDeleted: false,
      llmSummary
    };
    
    const docRef = await addDoc(logRef, entry);
    return docRef.id;
  } catch (error) {
    console.error('Error creating behavior log:', error);
    throw error;
  }
}; 