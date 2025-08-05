# Prompt Chain Storage & Model Training Data

## Overview

This document defines how the prompt-response chain is stored in the database, including both utilized and discarded prompts. This data structure is critical for model training as it provides the complete context of user interactions with AI-generated prompts. The schema is designed to handle deletions and edits without corrupting training data.

## Conversation Chain Structure

### **Complete Chain Example**
```
User Response 1: "I struggle with perfectionism..."
AI Prompt 1: "How does this perfectionism show up in your daily life?" [UTILIZED]
User Response 2: "It shows up when I..."
AI Prompt 2: "What would it feel like to be less perfect?" [DISCARDED - Shuffled]
AI Prompt 3: "Can you give me a specific example?" [DISCARDED - Shuffled]
AI Prompt 4: "How does this affect your relationships?" [UTILIZED]
User Response 3: "I tend to..."
```

## Database Collections for Chain Storage

### 1. `journal_entries` Collection - Utilized Prompts & Responses

**Purpose**: Stores all entries that are part of the actual conversation chain

**Chain Structure**:
```typescript
interface JournalEntry {
  id: string;                    // Auto-generated Firestore ID
  userId: string;                // Firebase Auth UID
  content: string;               // Entry content
  wordCount: number;             // Calculated word count
  entryType: 'module_journal';   // Always module_journal for chain entries
  moduleId: string;              // Module identifier
  submoduleId: string;           // Submodule identifier
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
```

**Example Chain in `journal_entries`**:
```json
[
  {
    "id": "entry_1",
    "userId": "user123",
    "content": "I struggle with perfectionism...",
    "entryType": "module_journal",
    "moduleId": "introduction",
    "submoduleId": "intro-1",
    "chainPosition": 1,
    "isAIPrompt": false,
    "tags": [],
    "trainingDataPreserved": true,
    "isDeleted": false,
    "createdAt": "2025-08-01T15:00:00.000Z"
  },
  {
    "id": "entry_2",
    "userId": "user123",
    "content": "How does this perfectionism show up in your daily life?",
    "entryType": "module_journal",
    "moduleId": "introduction",
    "submoduleId": "intro-1",
    "chainPosition": 2,
    "isAIPrompt": true,
    "tags": ["ai-prompt", "follow-up"],
    "parentEntryId": "entry_1",
    "promptContext": {
      "originalSubmodulePrompt": "Tell me about your background and experience.",
      "userResponseThatTriggered": "I struggle with perfectionism...",
      "shuffleCount": 0
    },
    "trainingDataPreserved": true,
    "isDeleted": false,
    "createdAt": "2025-08-01T15:01:00.000Z"
  },
  {
    "id": "entry_3",
    "userId": "user123",
    "content": "It shows up when I...",
    "entryType": "module_journal",
    "moduleId": "introduction",
    "submoduleId": "intro-1",
    "chainPosition": 3,
    "isAIPrompt": false,
    "tags": [],
    "parentEntryId": "entry_2",
    "trainingDataPreserved": true,
    "isDeleted": false,
    "createdAt": "2025-08-01T15:02:00.000Z"
  }
]
```

### 2. `discarded_prompts` Collection - Discarded Prompts

**Purpose**: Stores all AI prompts that were generated but not used in the conversation

**Structure**:
```typescript
interface DiscardedPrompt {
  id: string;                    // Auto-generated Firestore ID
  userId: string;                // Firebase Auth UID
  moduleId: string;              // Module identifier
  submoduleId: string;           // Submodule identifier
  discardedPrompt: string;       // The prompt that was discarded
  originalPrompt: string;        // Original submodule prompt
  userResponse: string;          // User's response that led to the prompt
  shuffleCount: number;          // How many times user shuffled
  reason: 'shuffle' | 'timeout'; // Why prompt was discarded (shuffle == reject)
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
```

**Example Discarded Prompts**:
```json
[
  {
    "id": "discarded_1",
    "userId": "user123",
    "moduleId": "introduction",
    "submoduleId": "intro-1",
    "discardedPrompt": "What would it feel like to be less perfect?",
    "originalPrompt": "Tell me about your background and experience.",
    "userResponse": "I struggle with perfectionism...",
    "shuffleCount": 1,
    "reason": "shuffle", // shuffle == reject
    "chainPosition": 2,
    "parentEntryId": "entry_1",
    "timestamp": "2025-08-01T15:01:30.000Z",
    "promptLength": 42,
    "wordCount": 8,
    "hasQuestionMark": true,
    "hasPersonalPronouns": true,
    "hasEmotionalWords": true,
    "promptFeatures": {
      "startsWithQuestion": true,
      "endsWithQuestion": true,
      "hasMultipleQuestions": false,
      "averageWordLength": 5.25,
      "emotionalIntensity": 0.7,
      "personalizationLevel": 0.8
    },
    "trainingDataPreserved": true
  },
  {
    "id": "discarded_2",
    "userId": "user123",
    "moduleId": "introduction",
    "submoduleId": "intro-1",
    "discardedPrompt": "Can you give me a specific example?",
    "originalPrompt": "Tell me about your background and experience.",
    "userResponse": "I struggle with perfectionism...",
    "shuffleCount": 2,
    "reason": "shuffle", // shuffle == reject
    "chainPosition": 2,
    "parentEntryId": "entry_1",
    "timestamp": "2025-08-01T15:02:00.000Z",
    "promptLength": 35,
    "wordCount": 7,
    "hasQuestionMark": true,
    "hasPersonalPronouns": true,
    "hasEmotionalWords": false,
    "promptFeatures": {
      "startsWithQuestion": true,
      "endsWithQuestion": true,
      "hasMultipleQuestions": false,
      "averageWordLength": 5.0,
      "emotionalIntensity": 0.2,
      "personalizationLevel": 0.6
    },
    "trainingDataPreserved": true
  }
]
```

## Handling Deletions and Edits

### **Soft Delete Strategy**
```typescript
// When user deletes an entry
const handleDeleteResponse = async (entryId: string) => {
  // Mark as deleted but preserve training data
  await updateDoc(doc(db, 'journal_entries', entryId), {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    deletionReason: 'user_deleted',
    trainingDataPreserved: true // Ensure training data is preserved
  });
  
  // Remove from UI but keep in database for training
  setSavedEntries(prev => prev.filter(entry => entry.id !== entryId));
};
```

### **Edit Preservation Strategy**
```typescript
// When user edits an entry
const handleUpdateResponse = async () => {
  const originalEntry = savedEntries.find(e => e.id === editingEntryId);
  
  // Store original content for training
  await updateDoc(doc(db, 'journal_entries', editingEntryId), {
    content: editingContent,
    originalContent: originalEntry?.content, // Preserve original for training
    isEdited: true,
    editHistory: arrayUnion({
      timestamp: serverTimestamp(),
      previousContent: originalEntry?.content || '',
      newContent: editingContent
    }),
    trainingDataPreserved: true
  });
};
```

### **Training Data Query Strategy**
```typescript
// Get training data excluding deleted entries
export const getTrainingData = async (userId: string, moduleId: string, submoduleId: string) => {
  const q = query(
    collection(db, 'journal_entries'),
    where('userId', '==', userId),
    where('moduleId', '==', moduleId),
    where('submoduleId', '==', submoduleId),
    where('isDeleted', '==', false) // Exclude deleted entries
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};
```

## Chain Relationship Mapping

### **Complete Chain with Discarded Prompts**
```
Chain Position 1: User Response "I struggle with perfectionism..."
├── Chain Position 2: AI Prompt "How does this perfectionism show up?" [UTILIZED]
│   └── Chain Position 3: User Response "It shows up when I..." [UTILIZED]
└── Discarded Position 2: AI Prompt "What would it feel like to be less perfect?" [DISCARDED - Shuffle]
└── Discarded Position 2: AI Prompt "Can you give me a specific example?" [DISCARDED - Shuffle]
```

### **Database Relationships**
```typescript
// journal_entries collection - Utilized chain
{
  "entry_1": {
    "chainPosition": 1,
    "childEntryIds": ["entry_2"],
    "isAIPrompt": false,
    "isDeleted": false
  },
  "entry_2": {
    "chainPosition": 2,
    "parentEntryId": "entry_1",
    "childEntryIds": ["entry_3"],
    "isAIPrompt": true,
    "isDeleted": false
  },
  "entry_3": {
    "chainPosition": 3,
    "parentEntryId": "entry_2",
    "isAIPrompt": false,
    "isDeleted": false
  }
}

// discarded_prompts collection - Discarded alternatives
{
  "discarded_1": {
    "chainPosition": 2,
    "parentEntryId": "entry_1",
    "wouldBeChildEntryId": null, // Never used
    "reason": "shuffle" // shuffle == reject
  },
  "discarded_2": {
    "chainPosition": 2,
    "parentEntryId": "entry_1",
    "wouldBeChildEntryId": null, // Never used
    "reason": "shuffle" // shuffle == reject
  }
}
```

## Model Training Data Structure

### **Training Dataset Format**
```typescript
interface TrainingExample {
  // Input context
  userResponse: string;          // User's original response
  originalPrompt: string;        // Submodule prompt
  moduleContext: string;         // Module and submodule context
  
  // Generated prompts (both utilized and discarded)
  generatedPrompts: {
    utilized: {
      prompt: string;
      userFollowUp: string;      // User's response to this prompt
      features: PromptFeatures;
    };
    discarded: Array<{
      prompt: string;
      reason: 'shuffle' | 'timeout'; // shuffle == reject
      shuffleCount: number;
      features: PromptFeatures;
    }>;
  };
  
  // Outcome metrics
  outcome: {
    totalShuffles: number;
    timeToAccept: number;        // Seconds until prompt was accepted
    userEngagement: number;      // Length of follow-up response
    conversationContinuation: boolean; // Did conversation continue?
  };
  
  // Data integrity flags
  dataIntegrity: {
    hasDeletions: boolean;       // Were any entries deleted?
    hasEdits: boolean;           // Were any entries edited?
    originalContentPreserved: boolean; // Is original content available?
  };
}
```

### **Example Training Data**
```json
{
  "userResponse": "I struggle with perfectionism...",
  "originalPrompt": "Tell me about your background and experience.",
  "moduleContext": "introduction:intro-1",
  "generatedPrompts": {
    "utilized": {
      "prompt": "How does this perfectionism show up in your daily life?",
      "userFollowUp": "It shows up when I...",
      "features": {
        "emotionalIntensity": 0.6,
        "personalizationLevel": 0.8,
        "questionType": "specific_example"
      }
    },
    "discarded": [
      {
        "prompt": "What would it feel like to be less perfect?",
        "reason": "shuffle", // shuffle == reject
        "shuffleCount": 1,
        "features": {
          "emotionalIntensity": 0.7,
          "personalizationLevel": 0.8,
          "questionType": "emotional_exploration"
        }
      },
      {
        "prompt": "Can you give me a specific example?",
        "reason": "shuffle", // shuffle == reject
        "shuffleCount": 2,
        "features": {
          "emotionalIntensity": 0.2,
          "personalizationLevel": 0.6,
          "questionType": "factual_request"
        }
      }
    ]
  },
  "outcome": {
    "totalShuffles": 2,
    "timeToAccept": 120, // 2 minutes
    "userEngagement": 45, // 45 words in follow-up
    "conversationContinuation": true
  },
  "dataIntegrity": {
    "hasDeletions": false,
    "hasEdits": false,
    "originalContentPreserved": true
  }
}
```

## Data Collection Functions

### **Utilized Prompt Storage**
```typescript
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
  const entry = {
    userId,
    content,
    entryType: 'module_journal' as const,
    moduleId,
    submoduleId,
    tags: ['ai-prompt', 'follow-up'],
    isAIPrompt: true,
    chainPosition: context.chainPosition,
    parentEntryId: context.parentEntryId,
    promptContext: {
      originalSubmodulePrompt: context.originalPrompt,
      userResponseThatTriggered: context.userResponse,
      shuffleCount: context.shuffleCount
    },
    trainingDataPreserved: true,
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'journal_entries'), entry);
  return docRef.id;
};
```

### **Discarded Prompt Storage**
```typescript
export const trackDiscardedPrompt = async (
  userId: string,
  moduleId: string,
  submoduleId: string,
  discardedPrompt: string,
  context: {
    originalPrompt: string;
    userResponse: string;
    shuffleCount: number;
    reason: 'shuffle' | 'timeout'; // shuffle == reject
    chainPosition: number;
    parentEntryId: string;
  }
): Promise<void> => {
  const discardedPromptEntry = {
    userId,
    moduleId,
    submoduleId,
    discardedPrompt,
    originalPrompt: context.originalPrompt,
    userResponse: context.userResponse,
    shuffleCount: context.shuffleCount,
    reason: context.reason, // shuffle == reject
    chainPosition: context.chainPosition,
    parentEntryId: context.parentEntryId,
    timestamp: serverTimestamp(),
    
    // Training metadata
    promptLength: discardedPrompt.length,
    wordCount: calculateWordCount(discardedPrompt),
    hasQuestionMark: discardedPrompt.includes('?'),
    hasPersonalPronouns: /(you|your|yourself)/i.test(discardedPrompt),
    hasEmotionalWords: /(feel|think|believe|wonder|consider)/i.test(discardedPrompt),
    
    // Advanced features for model training
    promptFeatures: {
      startsWithQuestion: discardedPrompt.trim().startsWith('?'),
      endsWithQuestion: discardedPrompt.trim().endsWith('?'),
      hasMultipleQuestions: (discardedPrompt.match(/\?/g) || []).length > 1,
      averageWordLength: discardedPrompt.split(' ').reduce((acc, word) => acc + word.length, 0) / discardedPrompt.split(' ').length,
      emotionalIntensity: calculateEmotionalIntensity(discardedPrompt),
      personalizationLevel: calculatePersonalizationLevel(discardedPrompt)
    },
    
    trainingDataPreserved: true
  };
  
  await addDoc(collection(db, 'discarded_prompts'), discardedPromptEntry);
};
```

## Query Patterns for Model Training

### **Get Complete Chain with Discarded Prompts**
```typescript
export const getCompletePromptChain = async (
  userId: string,
  moduleId: string,
  submoduleId: string
): Promise<{
  utilizedChain: JournalEntry[];
  discardedPrompts: DiscardedPrompt[];
}> => {
  // Get utilized chain (excluding deleted entries)
  const utilizedChain = await loadSubmoduleEntries(userId, moduleId, submoduleId);
  const activeChain = utilizedChain.filter(entry => !entry.isDeleted);
  
  // Get discarded prompts for this submodule
  const discardedPrompts = await getDiscardedPrompts(userId, moduleId, submoduleId);
  
  return { utilizedChain: activeChain, discardedPrompts };
};
```

### **Get Training Dataset**
```typescript
export const getTrainingDataset = async (
  userId: string,
  moduleId: string,
  submoduleId: string
): Promise<TrainingExample[]> => {
  const { utilizedChain, discardedPrompts } = await getCompletePromptChain(userId, moduleId, submoduleId);
  
  // Group by chain position and create training examples
  const trainingExamples: TrainingExample[] = [];
  
  // Process each AI prompt in the chain
  for (const entry of utilizedChain) {
    if (entry.isAIPrompt) {
      const discardedAlternatives = discardedPrompts.filter(
        dp => dp.chainPosition === entry.chainPosition
      );
      
      trainingExamples.push({
        userResponse: entry.promptContext?.userResponseThatTriggered || '',
        originalPrompt: entry.promptContext?.originalSubmodulePrompt || '',
        moduleContext: `${moduleId}:${submoduleId}`,
        generatedPrompts: {
          utilized: {
            prompt: entry.content,
            userFollowUp: utilizedChain.find(e => e.parentEntryId === entry.id)?.content || '',
            features: extractPromptFeatures(entry.content)
          },
          discarded: discardedAlternatives.map(dp => ({
            prompt: dp.discardedPrompt,
            reason: dp.reason, // shuffle == reject
            shuffleCount: dp.shuffleCount,
            features: dp.promptFeatures
          }))
        },
        outcome: calculateOutcomeMetrics(entry, discardedAlternatives),
        dataIntegrity: {
          hasDeletions: utilizedChain.some(e => e.isDeleted),
          hasEdits: utilizedChain.some(e => e.isEdited),
          originalContentPreserved: utilizedChain.every(e => e.originalContent || !e.isEdited)
        }
      });
    }
  }
  
  return trainingExamples;
};
```

## Security Rules for Chain Data

```javascript
// journal_entries - Full read/write for user's own entries
match /journal_entries/{entryId} {
  allow read, write: if request.auth != null && 
    (resource == null || resource.data.userId == request.auth.uid);
}

// discarded_prompts - Write-only for analytics
match /discarded_prompts/{promptId} {
  allow write: if request.auth != null && 
    (resource == null || resource.data.userId == request.auth.uid);
  // No read access - analytics data only
}
```

## Model Training Applications

### **1. Prompt Quality Improvement**
- **Utilized vs Discarded Analysis**: Compare features of accepted vs rejected prompts
- **Shuffle Pattern Learning**: Understand how many shuffles users typically need
- **Rejection Reason Analysis**: Learn what makes prompts unacceptable (shuffle == reject)

### **2. User Preference Modeling**
- **Individual Patterns**: Track each user's prompt preferences
- **Engagement Metrics**: Measure response quality to different prompt types
- **Conversation Flow**: Understand what keeps conversations going

### **3. A/B Testing Framework**
- **Prompt Variations**: Test different prompt styles systematically
- **Success Metrics**: Measure acceptance rates and engagement
- **Iterative Improvement**: Continuously refine prompt generation

### **4. Data Integrity Management**
- **Soft Deletes**: Preserve training data while allowing user deletions
- **Edit Tracking**: Maintain original content for training while allowing edits
- **Chain Preservation**: Ensure conversation flow remains intact for training

This comprehensive data structure ensures that every interaction with AI prompts is captured for model training, providing rich context for improving the prompt generation system while handling deletions and edits gracefully. 