import { collection, query, orderBy, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateFollowUpPrompt, generateEntrySummary } from './googleAIService';

export interface HistoryEntry {
  id: string;
  type: 'freeform' | 'module' | 'meal' | 'behavior';
  title: string;
  description: string;
  content: string;
  createdAt: Date;
  metadata: {
    moduleId?: string;
    submoduleId?: string;
    mealType?: string;
    wordCount: number;
    emotions?: string[];
    affect?: number;
    location?: string;
    socialContext?: string;
    // Pre/post data for logs
    satietyPre?: number;
    satietyPost?: number;
    emotionPre?: string[];
    emotionPost?: string[];
    affectPre?: number;
    affectPost?: number;
    // Conversation thread for journal entries
    conversationThread?: Array<{
      id: string;
      content: string;
      type: 'user_response' | 'ai_prompt';
      timestamp: Date;
    }>;
  };
  llmSummary?: string;
}

export interface GroupedHistoryEntries {
  date: string;
  entries: HistoryEntry[];
}

export const getAllUserHistory = async (userId: string): Promise<GroupedHistoryEntries[]> => {
  try {
    console.log('Fetching history for user:', userId);
    const allEntries: HistoryEntry[] = [];

    // Fetch freeform entries
    console.log('Fetching freeform entries...');
    const freeformEntries = await getFreeformHistory(userId);
    console.log('Found freeform entries:', freeformEntries.length);
    allEntries.push(...freeformEntries);

    // Fetch module entries
    console.log('Fetching module entries...');
    const moduleEntries = await getModuleHistory(userId);
    console.log('Found module entries:', moduleEntries.length);
    allEntries.push(...moduleEntries);

    // Fetch meal logs
    console.log('Fetching meal logs...');
    const mealEntries = await getMealHistory(userId);
    console.log('Found meal entries:', mealEntries.length);
    allEntries.push(...mealEntries);

    // Fetch behavior logs
    console.log('Fetching behavior logs...');
    const behaviorEntries = await getBehaviorHistory(userId);
    console.log('Found behavior entries:', behaviorEntries.length);
    allEntries.push(...behaviorEntries);

    console.log('Total entries found:', allEntries.length);

    // Generate summaries for entries that don't have them
    await generateMissingSummaries(allEntries);

    // Sort all entries by creation date (newest first)
    allEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Group entries by date
    const groupedEntries = groupEntriesByDate(allEntries);
    console.log('Grouped entries by date:', groupedEntries.length, 'groups');

    return groupedEntries;
  } catch (error) {
    console.error('Error fetching user history:', error);
    throw error;
  }
};

const generateMissingSummaries = async (entries: HistoryEntry[]): Promise<void> => {
  console.log('Checking for entries without summaries...');
  
  for (const entry of entries) {
    if (!entry.llmSummary) {
      console.log(`Generating summary for entry ${entry.id} (${entry.type})`);
      try {
        entry.llmSummary = await generateEntrySummary({
          content: entry.content,
          entryType: entry.type,
          metadata: {
            mealType: entry.metadata.mealType,
            location: entry.metadata.location,
            socialContext: entry.metadata.socialContext,
            satietyPre: entry.metadata.satietyPre,
            satietyPost: entry.metadata.satietyPost,
            emotionPre: entry.metadata.emotionPre,
            emotionPost: entry.metadata.emotionPost,
            affectPre: entry.metadata.affectPre,
            affectPost: entry.metadata.affectPost
          }
        });
        console.log(`Generated summary for ${entry.id}:`, entry.llmSummary);
      } catch (error) {
        console.error('Error generating summary for entry:', entry.id, error);
        // Fallback to simple summary
        entry.llmSummary = generateSimpleSummary(entry);
      }
    }
  }
};

const getFreeformHistory = async (userId: string): Promise<HistoryEntry[]> => {
  try {
    const entriesRef = collection(db, 'users', userId, 'freeform_entries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    // Group entries by session to create conversation threads
    const sessionGroups: { [sessionId: string]: any[] } = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.isDeleted) {
        const sessionId = data.sessionId || 'default';
        if (!sessionGroups[sessionId]) {
          sessionGroups[sessionId] = [];
        }
        sessionGroups[sessionId].push({ id: doc.id, ...data });
      }
    });

    // Create entries for each session with conversation threads
    const entries: HistoryEntry[] = [];
    
    Object.values(sessionGroups).forEach(sessionEntries => {
      // Sort by chain position
      sessionEntries.sort((a, b) => (a.chainPosition || 0) - (b.chainPosition || 0));
      
      if (sessionEntries.length > 0) {
        const firstEntry = sessionEntries[0];
        const conversationThread = sessionEntries.map(entry => ({
          id: entry.id,
          content: entry.content,
          type: entry.isAIPrompt ? 'ai_prompt' as const : 'user_response' as const,
          timestamp: entry.createdAt.toDate()
        }));

        entries.push({
          id: firstEntry.id,
          type: 'freeform' as const,
          title: formatDateTime(firstEntry.createdAt.toDate()),
          description: `Freeform journaling session`,
          content: conversationThread.map(entry => 
            `${entry.type === 'ai_prompt' ? 'AI: ' : 'You: '}${entry.content}`
          ).join('\n\n'),
          createdAt: firstEntry.createdAt.toDate(),
          metadata: {
            wordCount: sessionEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0),
            moduleId: undefined,
            submoduleId: undefined,
            conversationThread
          },
          llmSummary: firstEntry.llmSummary
        });
      }
    });
    
    return entries;
  } catch (error) {
    console.error('Error fetching freeform history:', error);
    return [];
  }
};

const getModuleHistory = async (userId: string): Promise<HistoryEntry[]> => {
  try {
    const entries: HistoryEntry[] = [];
    
    // Get all modules for the user
    const modulesRef = collection(db, 'users', userId, 'modules');
    const modulesSnapshot = await getDocs(modulesRef);
    
    for (const moduleDoc of modulesSnapshot.docs) {
      const moduleId = moduleDoc.id;
      const moduleData = moduleDoc.data();
      
      try {
        // Get all submodules for this module
        const submodulesRef = collection(db, 'users', userId, 'modules', moduleId, 'submodules');
        const submodulesSnapshot = await getDocs(submodulesRef);
        
        for (const submoduleDoc of submodulesSnapshot.docs) {
          const submoduleId = submoduleDoc.id;
          const submoduleData = submoduleDoc.data();
          
          try {
            // Get all entries for this submodule
            const entriesRef = collection(db, 'users', userId, 'modules', moduleId, 'submodules', submoduleId, 'entries');
            const q = query(entriesRef, orderBy('chainPosition', 'asc'));
            const entriesSnapshot = await getDocs(q);
            
            // Group entries by chain to create conversation threads
            const chainGroups: { [chainId: string]: any[] } = {};
            
            entriesSnapshot.docs.forEach(doc => {
              const data = doc.data();
              const chainId = data.parentEntryId || 'root';
              if (!chainGroups[chainId]) {
                chainGroups[chainId] = [];
              }
              chainGroups[chainId].push({ id: doc.id, ...data });
            });

            // Create entries for each conversation chain
            Object.values(chainGroups).forEach(chainEntries => {
              if (chainEntries.length > 0) {
                const firstEntry = chainEntries[0];
                const conversationThread = chainEntries.map(entry => ({
                  id: entry.id,
                  content: entry.content,
                  type: entry.type === 'ai_prompt' ? 'ai_prompt' as const : 'user_response' as const,
                  timestamp: entry.createdAt.toDate()
                }));

                entries.push({
                  id: firstEntry.id,
                  type: 'module' as const,
                  title: formatDateTime(firstEntry.createdAt.toDate()),
                  description: `${moduleData.title || 'Module'} - ${submoduleData.title || 'Submodule'}`,
                  content: conversationThread.map(entry => 
                    `${entry.type === 'ai_prompt' ? 'AI: ' : 'You: '}${entry.content}`
                  ).join('\n\n'),
                  createdAt: firstEntry.createdAt.toDate(),
                  metadata: {
                    moduleId,
                    submoduleId,
                    wordCount: chainEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0),
                    conversationThread
                  },
                  llmSummary: firstEntry.llmSummary
                });
              }
            });
          } catch (submoduleError) {
            console.error(`Error fetching entries for submodule ${submoduleId}:`, submoduleError);
          }
        }
      } catch (moduleError) {
        console.error(`Error fetching submodules for module ${moduleId}:`, moduleError);
      }
    }
    
    return entries;
  } catch (error) {
    console.error('Error fetching module history:', error);
    return [];
  }
};

const getMealHistory = async (userId: string): Promise<HistoryEntry[]> => {
  try {
    const entries: HistoryEntry[] = [];
    
    // Try user-specific collection first (newer structure)
    try {
      const entriesRef = collection(db, 'users', userId, 'meal_logs');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.isDeleted) {
          entries.push({
            id: doc.id,
            type: 'meal' as const,
            title: formatDateTime(data.createdAt.toDate()),
            description: `${data.mealType} - ${data.locationContext}`,
            content: data.description,
            createdAt: data.createdAt.toDate(),
            metadata: {
              mealType: data.mealType,
              wordCount: data.wordCount || 0,
              emotions: [...(data.emotionPre || []), ...(data.emotionPost || [])],
              affect: data.affectPost,
              location: data.locationContext,
              socialContext: data.socialContext,
              // Pre/post data
              satietyPre: data.satietyPre,
              satietyPost: data.satietyPost,
              emotionPre: data.emotionPre || [],
              emotionPost: data.emotionPost || [],
              affectPre: data.affectPre,
              affectPost: data.affectPost
            },
            llmSummary: data.llmSummary
          });
        }
      });
    } catch (error) {
      console.log('No user-specific meal logs found, checking root collection');
    }
    
    // Try root-level collection (legacy structure)
    try {
      const entriesRef = collection(db, 'mealLogs');
      const q = query(entriesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt.toDate();
        
        entries.push({
          id: doc.id,
          type: 'meal' as const,
          title: formatDateTime(createdAt),
          description: `${data.mealType} - ${data.locationContext}`,
          content: data.description,
          createdAt,
          metadata: {
            mealType: data.mealType,
            wordCount: data.wordCount || 0,
            emotions: [...(data.emotionPre || []), ...(data.emotionPost || [])],
            affect: data.affectPost,
            location: data.locationContext,
            socialContext: data.socialContext,
            // Pre/post data
            satietyPre: data.satietyPre,
            satietyPost: data.satietyPost,
            emotionPre: data.emotionPre || [],
            emotionPost: data.emotionPost || [],
            affectPre: data.affectPre,
            affectPost: data.affectPost
          },
          llmSummary: data.llmSummary
        });
      });
    } catch (error) {
      console.log('No root-level meal logs found');
    }
    
    return entries;
  } catch (error) {
    console.error('Error fetching meal history:', error);
    return [];
  }
};

const getBehaviorHistory = async (userId: string): Promise<HistoryEntry[]> => {
  try {
    const entries: HistoryEntry[] = [];
    
    // Try user-specific collection first (newer structure)
    try {
      const entriesRef = collection(db, 'users', userId, 'behavior_logs');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.isDeleted) {
          entries.push({
            id: doc.id,
            type: 'behavior' as const,
            title: formatDateTime(data.createdAt.toDate()),
            description: 'Behavior log entry',
            content: data.description,
            createdAt: data.createdAt.toDate(),
            metadata: {
              wordCount: data.wordCount || 0,
              emotions: [...(data.emotionPre || []), ...(data.emotionPost || [])],
              affect: data.affectPost,
              // Pre/post data
              emotionPre: data.emotionPre || [],
              emotionPost: data.emotionPost || [],
              affectPre: data.affectPre,
              affectPost: data.affectPost
            },
            llmSummary: data.llmSummary
          });
        }
      });
    } catch (error) {
      console.log('No user-specific behavior logs found, checking root collection');
    }
    
    // Try root-level collection (legacy structure)
    try {
      const entriesRef = collection(db, 'behaviorLogs');
      const q = query(entriesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt.toDate();
        
        entries.push({
          id: doc.id,
          type: 'behavior' as const,
          title: formatDateTime(createdAt),
          description: 'Behavior log entry',
          content: data.description,
          createdAt,
          metadata: {
            wordCount: data.wordCount || 0,
            emotions: [...(data.emotionPre || []), ...(data.emotionPost || [])],
            affect: data.affectPost,
            // Pre/post data
            emotionPre: data.emotionPre || [],
            emotionPost: data.emotionPost || [],
            affectPre: data.affectPre,
            affectPost: data.affectPost
          },
          llmSummary: data.llmSummary
        });
      });
    } catch (error) {
      console.log('No root-level behavior logs found');
    }
    
    return entries;
  } catch (error) {
    console.error('Error fetching behavior history:', error);
    return [];
  }
};

const groupEntriesByDate = (entries: HistoryEntry[]): GroupedHistoryEntries[] => {
  const grouped: { [key: string]: HistoryEntry[] } = {};
  
  entries.forEach(entry => {
    const dateKey = formatDate(entry.createdAt);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(entry);
  });
  
  return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({
      date,
      entries: grouped[date]
    }));
};

const generateSimpleSummary = (entry: HistoryEntry): string => {
  const content = entry.content;
  const wordCount = entry.metadata.wordCount;
  
  if (wordCount < 20) {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }
  
  // For longer entries, take the first sentence or first 150 characters
  const firstSentence = content.match(/[^.!?]+[.!?]+/);
  if (firstSentence && firstSentence[0].length < 150) {
    return firstSentence[0].trim();
  }
  
  return content.length > 150 ? content.substring(0, 150) + '...' : content;
};

const formatDateTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}; 