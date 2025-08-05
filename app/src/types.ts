import { Timestamp } from 'firebase/firestore';

export interface JournalEntry {
  id: string;                    // Auto-generated Firestore ID
  userId: string;                // Firebase Auth UID
  content: string;               // Entry content
  wordCount: number;             // Calculated word count
  entryType: 'module_journal';   // Always module_journal for chain entries
  type: 'module_journal' | 'ai_prompt'; // For UI display
  moduleId: string;              // Module identifier
  submoduleId: string;          // Submodule identifier
  createdAt: Timestamp;          // Chronological order
  updatedAt: Timestamp;          // Last modification
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];                // ['ai-prompt', 'follow-up'] for AI prompts
  isEdited: boolean;             // Track if entry was edited
  editHistory: EditRecord[];     // Track edit history
  
  // Chain-specific metadata
  chainPosition: number;         // Position in conversation chain (1, 2, 3...)
  parentEntryId?: string;        // Reference to previous entry in chain
  childEntryIds?: string[];      // References to subsequent entries
  isAIPrompt: boolean;           // Whether this is an AI-generated prompt
  promptContext?: {              // Context for AI prompts
    originalSubmodulePrompt: string;
    userResponseThatTriggered: string;
    shuffleCount: number;        // How many shuffles before this prompt was accepted
  };
  
  // Training data preservation
  trainingDataPreserved: boolean; // Flag to ensure training data isn't lost
  originalContent?: string;      // Original content before edits (for training)
  deletionReason?: string;       // Why entry was deleted (if applicable)
  isDeleted: boolean;            // Soft delete flag
  deletedAt?: Timestamp;         // When entry was deleted
}

export interface EditRecord {
  timestamp: Timestamp;
  previousContent: string;
  newContent: string;
}

export interface DiscardedPrompt {
  id: string;                    // Auto-generated Firestore ID
  userId: string;                // Firebase Auth UID
  moduleId: string;              // Module identifier
  submoduleId: string;          // Submodule identifier
  discardedPrompt: string;       // The prompt that was discarded
  originalPrompt: string;        // Original submodule prompt
  userResponse: string;          // User's response that led to the prompt
  shuffleCount: number;          // How many times user shuffled
  reason: 'shuffle' | 'timeout'; // Why prompt was discarded
  timestamp: Timestamp;          // When prompt was discarded
  
  // Chain context
  chainPosition: number;         // Where this would have been in the chain
  parentEntryId: string;         // Reference to the entry that triggered this prompt
  wouldBeChildEntryId?: string;  // Reference to entry that would have followed
  
  // Training metadata
  promptLength: number;          // Character count of discarded prompt
  wordCount: number;             // Word count of discarded prompt
  hasQuestionMark: boolean;      // Whether prompt contains question mark
  hasPersonalPronouns: boolean;  // Whether prompt uses personal pronouns
  hasEmotionalWords: boolean;    // Whether prompt contains emotional words
  
  // Model training features
  promptFeatures: {
    startsWithQuestion: boolean;
    endsWithQuestion: boolean;
    hasMultipleQuestions: boolean;
    averageWordLength: number;
    emotionalIntensity: number;  // 0-1 scale
    personalizationLevel: number; // 0-1 scale
  };
  
  // Training data preservation
  trainingDataPreserved: boolean; // Flag to ensure training data isn't lost
}

export interface ModuleProgress {
  submodules: {
    [submoduleId: string]: {
      status: 'not_started' | 'in_progress' | 'completed';
      completedAt?: Timestamp;
      currentPosition: number;  // Position in entry chain
    };
  };
  lastAccessed: Timestamp;
  unlockedAt?: Timestamp;    // When module became available
  completedAt?: Timestamp;   // When all submodules completed
}

export interface Module {
  id: string;              // Unique identifier (e.g., 'introduction')
  title: string;           // Display title
  description: string;     // Brief description
  order: number;           // Display and progression order
  isLocked?: boolean;      // Whether module requires unlocking
  submodules: Submodule[];
}

export interface Submodule {
  id: string;              // Unique identifier (e.g., 'intro-1')
  title: string;           // Display title
  prompt: string;          // Initial journaling prompt
  wordCountRequirement?: {
    minimum: number;
    maximum?: number;
  };
  order: number;           // Display and completion order
} 