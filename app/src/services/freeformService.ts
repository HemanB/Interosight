import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateFollowUpPrompt } from './googleAIService';
import type { JournalEntry } from '../types';

export interface FreeformEntry {
  id: string;
  userId: string;
  content: string;
  wordCount: number;
  type: 'freeform';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEdited: boolean;
  editHistory: any[];
  isDeleted: boolean;
  chainPosition?: number;
  parentEntryId?: string;
  isAIPrompt?: boolean;
  sessionId?: string;
}

export const createFreeformEntry = async (
  userId: string, 
  content: string,
  isAIPrompt: boolean = false,
  parentEntryId?: string,
  sessionId?: string
): Promise<string> => {
  try {
    const entryRef = collection(db, 'users', userId, 'freeform_entries');
    
    // Get the next chain position by getting all entries in this session and finding the max
    const sessionEntriesRef = collection(db, 'users', userId, 'freeform_entries');
    const sessionEntriesSnapshot = await getDocs(sessionEntriesRef);
    const sessionEntries = sessionEntriesSnapshot.docs
      .map(doc => doc.data())
      .filter(entry => entry.sessionId === sessionId);
    const maxChainPosition = Math.max(0, ...sessionEntries.map(e => e.chainPosition || 0));
    const chainPosition = maxChainPosition + 1;
    
    const entry: any = {
      content,
      wordCount: calculateWordCount(content),
      type: 'freeform',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isEdited: false,
      editHistory: [],
      isDeleted: false,
      chainPosition,
      isAIPrompt,
      sessionId
    };
    
    // Only include parentEntryId if it has a valid value
    if (parentEntryId) {
      entry.parentEntryId = parentEntryId;
    }
    
    const docRef = await addDoc(entryRef, entry);
    return docRef.id;
  } catch (error) {
    console.error('Error creating freeform entry:', error);
    throw error;
  }
};

export const getFreeformEntries = async (userId: string): Promise<FreeformEntry[]> => {
  try {
    const entriesRef = collection(db, 'users', userId, 'freeform_entries');
    // First get all entries, then filter and sort in memory
    // This avoids the composite index requirement
    const q = query(entriesRef);
    
    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FreeformEntry[];
    
    // Filter out deleted entries and sort by chain position
    return entries
      .filter(entry => !entry.isDeleted)
      .sort((a, b) => (a.chainPosition || 0) - (b.chainPosition || 0));
  } catch (error) {
    console.error('Error loading freeform entries:', error);
    throw error;
  }
};

export const generateFreeformReprompt = async (
  userId: string,
  userResponse: string,
  previousEntries: FreeformEntry[]
): Promise<string> => {
  try {
    // Convert previous entries to the format expected by generateFollowUpPrompt
    // Start with the user's initial response, then add AI prompts
    const conversationHistory = [];
    
    // Add the initial user response first
    conversationHistory.push({ content: userResponse, type: 'module_journal' as const });
    
    // Add any AI prompts that followed
    const aiPrompts = previousEntries
      .filter(e => e.isAIPrompt)
      .map(e => ({ content: e.content, type: 'ai_prompt' as const }));
    
    conversationHistory.push(...aiPrompts);

    // Create a synthetic original prompt for freeform journaling
    const originalPrompt = "Write freely about anything on your mind";

    const followUp = await generateFollowUpPrompt({
      userResponse,
      originalPrompt,
      previousPrompts: conversationHistory
    });

    return followUp;
  } catch (error) {
    console.error('Error generating freeform reprompt:', error);
    throw new Error('Failed to generate follow-up question. Please try again.');
  }
};

export const trackDiscardedFreeformPrompt = async (
  userId: string,
  discardedPrompt: string,
  context: {
    userResponse: string;
    reason: 'timeout' | 'error' | 'shuffle';
    chainPosition: number;
    parentEntryId: string;
    sessionId?: string;
  }
): Promise<void> => {
  try {
    console.log('Tracking discarded freeform prompt:', {
      userId,
      promptLength: discardedPrompt.length,
      reason: context.reason
    });

    const discardedRef = collection(db, 'users', userId, 'freeform_discarded');

    const discardedData: any = {
      userId,
      discardedPrompt,
      promptLength: discardedPrompt.length,
      wordCount: calculateWordCount(discardedPrompt),
      hasQuestionMark: discardedPrompt.includes('?'),
      hasPersonalPronouns: /\b(I|me|my|mine|we|us|our|ours)\b/i.test(discardedPrompt),
      reason: context.reason,
      chainPosition: context.chainPosition,
      parentEntryId: context.parentEntryId,
      userResponse: context.userResponse,
      timestamp: Timestamp.now(),
      trainingDataPreserved: true
    };
    
    // Only include sessionId if it has a valid value
    if (context.sessionId) {
      discardedData.sessionId = context.sessionId;
    }

    await addDoc(discardedRef, discardedData);
    console.log('Successfully tracked discarded freeform prompt');
  } catch (error) {
    console.error('Error tracking discarded freeform prompt:', error);
    throw error;
  }
};

const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}; 