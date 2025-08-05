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
import type { JournalEntry, ModuleProgress, DiscardedPrompt, Module, Submodule } from '../types';

// Default module content
const DEFAULT_MODULES: Record<string, Module> = {
  introduction: {
    id: 'introduction',
    title: 'Introduction',
    description: 'Setting the stage for recovery',
    order: 1,
    isLocked: false,
    submodules: [
      {
        id: 'welcome',
        title: 'Welcome to Your Recovery Journey',
        prompt: 'Take a moment to reflect on what brought you to this point. What does recovery mean to you right now?',
        wordCountRequirement: {
          minimum: 50
        },
        order: 1
      },
      {
        id: 'goals',
        title: 'Your Recovery Goals',
        prompt: 'What are your hopes and goals for your recovery journey? What would you like to achieve?',
        wordCountRequirement: {
          minimum: 75
        },
        order: 2
      },
      {
        id: 'support',
        title: 'Your Support System',
        prompt: 'Who are the people in your life who support your recovery? How do they help you?',
        wordCountRequirement: {
          minimum: 60
        },
        order: 3
      },
      {
        id: 'commitment',
        title: 'Your Commitment',
        prompt: 'What are you willing to commit to in your recovery? What small steps can you take today?',
        wordCountRequirement: {
          minimum: 50
        },
        order: 4
      }
    ]
  }
};

/**
 * Gets a module entry at a specific position
 */
export const getModuleEntry = async (
  userId: string,
  moduleId: string,
  submoduleId: string,
  chainPosition: number
): Promise<JournalEntry | null> => {
  try {
    const entriesRef = collection(
      db,
      'users', userId,
      'modules', moduleId,
      'submodules', submoduleId,
      'entries'
    );
    
    const q = query(
      entriesRef,
      where('chainPosition', '==', chainPosition),
      where('isDeleted', '==', false)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as JournalEntry;
  } catch (error) {
    console.error('Error getting module entry:', error);
    return null;
  }
};

/**
 * Creates a new module entry
 */
export const createModuleEntry = async (
  userId: string,
  moduleId: string,
  submoduleId: string,
  content: string,
  isAIPrompt: boolean,
  context?: {
    originalPrompt: string;
    userResponse: string;
    shuffleCount: number;
    parentEntryId?: string;
    chainPosition: number;
  }
): Promise<string> => {
  try {
    console.log('Creating module entry:', {
      userId,
      moduleId,
      submoduleId,
      isAIPrompt,
      hasContext: !!context
    });

    // Get current entries to determine chain position
    const entriesRef = collection(
      db,
      'users', userId,
      'modules', moduleId,
      'submodules', submoduleId,
      'entries'
    );
    
    const q = query(entriesRef, orderBy('chainPosition', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    const lastEntry = snapshot.docs[0]?.data();
    const chainPosition = lastEntry ? (lastEntry.chainPosition + 1) : 0;

    // Prepare entry data
    const entryData: Omit<JournalEntry, 'id'> = {
      content,
      userId,
      moduleId,
      submoduleId,
      type: isAIPrompt ? 'ai_prompt' : 'module_journal',
      entryType: 'module_journal',
      chainPosition,
      isAIPrompt,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      wordCount: content.trim().split(/\s+/).length,
      trainingDataPreserved: true,
      sentiment: 'neutral',
      tags: [],
      isEdited: false,
      editHistory: [],
      isDeleted: false
    };

    // Add optional context fields if provided
    if (context) {
      entryData.promptContext = {
        originalSubmodulePrompt: context.originalPrompt,
        userResponseThatTriggered: context.userResponse,
        shuffleCount: context.shuffleCount
      };
      
      // Only add parentEntryId if it exists
      if (context.parentEntryId) {
        entryData.parentEntryId = context.parentEntryId;
      }
    }

    console.log('Creating entry with data:', { ...entryData, content: content.substring(0, 50) + '...' });

    const docRef = await addDoc(entriesRef, entryData);
    console.log('Created entry:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating module entry:', error);
    throw error;
  }
};

/**
 * Gets all entries for a submodule
 */
export const getSubmoduleEntries = async (
  userId: string,
  moduleId: string,
  submoduleId: string
): Promise<JournalEntry[]> => {
  try {
    console.log('Getting entries for:', { userId, moduleId, submoduleId });
    
    const entriesRef = collection(
      db,
      'users', userId,
      'modules', moduleId,
      'submodules', submoduleId,
      'entries'
    );
    
    console.log('Querying entries at path:', entriesRef.path);
    
    // Simple query without isDeleted filter since we're not soft-deleting module entries
    const q = query(
      entriesRef,
      orderBy('chainPosition', 'asc')
    );
    
    const snapshot = await getDocs(q);
    console.log('Found entries:', snapshot.docs.length);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as JournalEntry));
  } catch (error) {
    console.error('Error getting submodule entries:', error);
    return [];
  }
};

/**
 * Gets module progress
 */
export const getModuleProgress = async (
  userId: string,
  moduleId: string
): Promise<ModuleProgress | null> => {
  try {
    const progressRef = doc(db, 'users', userId, 'module_progress', moduleId);
    const progressSnap = await getDoc(progressRef);
    
    if (!progressSnap.exists()) {
      const timestamp = serverTimestamp();
      const defaultProgress = {
        submodules: {},
        lastAccessed: timestamp,
        unlockedAt: moduleId === 'introduction' ? timestamp : undefined
      };
      await setDoc(progressRef, defaultProgress);
      return defaultProgress as ModuleProgress;
    }
    
    return progressSnap.data() as ModuleProgress;
  } catch (error) {
    console.error('Error getting module progress:', error);
    return null;
  }
};

/**
 * Gets module content
 */
export const getModuleContent = async (
  userId: string,
  moduleId: string
): Promise<Module | null> => {
  try {
    console.log('Getting module content for:', moduleId);
    
    // First check if this is a default module
    const defaultModule = DEFAULT_MODULES[moduleId];
    if (!defaultModule) {
      console.log('No default module found for:', moduleId);
      return null;
    }

    // Get the module reference
    const moduleRef = doc(db, 'users', userId, 'modules', moduleId);
    console.log('Checking module at path:', moduleRef.path);
    
    // Get the module document
    const moduleSnap = await getDoc(moduleRef);
    
    if (!moduleSnap.exists()) {
      console.log('Module does not exist, creating default module');
      
      // Create module document
      await setDoc(moduleRef, {
        ...defaultModule,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create submodule documents
      for (const submodule of defaultModule.submodules) {
        const submoduleRef = doc(db, 'users', userId, 'modules', moduleId, 'submodules', submodule.id);
        await setDoc(submoduleRef, {
          ...submodule,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Create module progress
      const progressRef = doc(db, 'users', userId, 'module_progress', moduleId);
      await setDoc(progressRef, {
        status: 'not_started',
        lastAccessed: serverTimestamp(),
        unlockedAt: moduleId === 'introduction' ? serverTimestamp() : null,
        submodules: Object.fromEntries(
          defaultModule.submodules.map(sub => [
            sub.id,
            {
              status: 'not_started',
              currentPosition: 0,
              lastAccessed: serverTimestamp()
            }
          ])
        )
      });

      console.log('Created default module and submodules');
      return defaultModule;
    }
    
    // Module exists, get the submodules
    const moduleData = moduleSnap.data() as Module;
    console.log('Found existing module:', moduleData);

    // Get all submodules
    const submodulesRef = collection(db, 'users', userId, 'modules', moduleId, 'submodules');
    const submodulesSnap = await getDocs(submodulesRef);
    
    const submodules = submodulesSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        prompt: data.prompt,
        wordCountRequirement: data.wordCountRequirement,
        order: data.order
      } as Submodule;
    });

    console.log('Found submodules:', submodules);

    // Return complete module with submodules
    return {
      ...moduleData,
      submodules: submodules.sort((a, b) => a.order - b.order)
    };
  } catch (error) {
    console.error('Error getting module content:', error);
    return null;
  }
};

/**
 * Completes a submodule
 */
export const completeSubmodule = async (
  userId: string,
  moduleId: string,
  submoduleId: string
): Promise<void> => {
  try {
    const progressRef = doc(db, 'users', userId, 'module_progress', moduleId);
    const timestamp = serverTimestamp();
    
    await setDoc(progressRef, {
      submodules: {
        [submoduleId]: {
          status: 'completed',
          completedAt: timestamp,
          lastAccessed: timestamp
        }
      },
      lastAccessed: timestamp
    }, { merge: true });
  } catch (error) {
    console.error('Error completing submodule:', error);
    throw error;
  }
};

/**
 * Tracks a discarded prompt for AI training
 */
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
    promptFeatures: {
      emotionalIntensity: number;
      personalizationLevel: number;
      questionType: string;
    };
  }
): Promise<void> => {
  try {
    console.log('Tracking discarded prompt:', {
      userId,
      moduleId,
      submoduleId,
      promptLength: discardedPrompt.length,
      reason: context.reason
    });

    const discardedRef = collection(
      db,
      'users', userId,
      'modules', moduleId,
      'submodules', submoduleId,
      'discarded'
    );

    // Calculate prompt features
    const words = discardedPrompt.trim().split(/\s+/);
    const averageWordLength = words.reduce((acc, word) => acc + word.length, 0) / words.length;
    const questionMarks = (discardedPrompt.match(/\?/g) || []).length;

    const discardedData: Omit<DiscardedPrompt, 'id'> = {
      userId,
      moduleId,
      submoduleId,
      discardedPrompt,
      promptLength: discardedPrompt.length,
      wordCount: words.length,
      hasQuestionMark: discardedPrompt.includes('?'),
      hasPersonalPronouns: /\b(I|me|my|mine|we|us|our|ours)\b/i.test(discardedPrompt),
      hasEmotionalWords: true, // TODO: Implement emotional word detection
      promptFeatures: {
        startsWithQuestion: discardedPrompt.trim().startsWith('?'),
        endsWithQuestion: discardedPrompt.trim().endsWith('?'),
        hasMultipleQuestions: questionMarks > 1,
        averageWordLength,
        emotionalIntensity: context.promptFeatures.emotionalIntensity,
        personalizationLevel: context.promptFeatures.personalizationLevel
      },
      reason: context.reason,
      chainPosition: context.chainPosition,
      parentEntryId: context.parentEntryId,
      timestamp: Timestamp.now(),
      originalPrompt: context.originalPrompt,
      userResponse: context.userResponse,
      shuffleCount: context.shuffleCount,
      trainingDataPreserved: true
    };

    console.log('Creating discarded prompt document');
    await addDoc(discardedRef, discardedData);
    console.log('Successfully tracked discarded prompt');
  } catch (error) {
    console.error('Error tracking discarded prompt:', error);
    throw error;
  }
}; 