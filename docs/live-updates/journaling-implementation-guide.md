# Journaling Implementation Guide

## Overview
This document provides a comprehensive guide for implementing the journaling functionalities in Interosight, including both freeform journaling and structured module journaling. It covers data models, CRUD operations, Firebase integration, and user experience requirements.

## Journaling System Architecture

### Two Journaling Types
1. **Freeform Journaling** (`FreeformJournalScreen`)
   - Unstructured writing about anything
   - No prompts or requirements
   - Optional word count goals
   - Entry history and editing

2. **Module Journaling** (`ModuleScreen`)
   - Structured prompts and submodules
   - Word count requirements (50-75 words)
   - Progress tracking and completion
   - LLM-powered follow-up prompts

## Data Models

### Shared Journal Entry Interface
```typescript
interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  wordCount: number;
  entryType: 'freeform' | 'module_journal';
  moduleId?: string; // Only for module journaling
  submoduleId?: string; // Only for module journaling
  createdAt: Date;
  updatedAt: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  tags?: string[];
  isEdited: boolean;
  editHistory?: {
    timestamp: Date;
    previousContent: string;
  }[];
}
```

### Module Progress Interface
```typescript
interface ModuleProgress {
  userId: string;
  moduleId: string;
  submoduleProgress: {
    [submoduleId: string]: {
      status: 'not_started' | 'in_progress' | 'completed';
      journalEntryId?: string;
      completedAt?: Date;
      wordCount?: number;
    };
  };
  overallProgress: number; // 0-100
  lastAccessed: Date;
  unlockedAt: Date;
  completedAt?: Date;
}
```

## Firebase Collections

### journal_entries Collection
```typescript
interface FirestoreJournalEntry {
  userId: string;
  content: string;
  wordCount: number;
  entryType: 'freeform' | 'module_journal';
  moduleId?: string;
  submoduleId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sentiment?: string;
  tags?: string[];
  isEdited: boolean;
  editHistory?: {
    timestamp: Timestamp;
    previousContent: string;
  }[];
}
```

### module_progress Collection
```typescript
interface FirestoreModuleProgress {
  userId: string;
  moduleId: string;
  submoduleProgress: {
    [submoduleId: string]: {
      status: string;
      journalEntryId?: string;
      completedAt?: Timestamp;
      wordCount?: number;
    };
  };
  overallProgress: number;
  lastAccessed: Timestamp;
  unlockedAt: Timestamp;
  completedAt?: Timestamp;
}
```

## CRUD Operations Implementation

### Create Operations

#### Freeform Journal Entry
```typescript
const createFreeformEntry = async (content: string) => {
  const entry = {
    userId: user.id,
    content,
    wordCount: calculateWordCount(content),
    entryType: 'freeform' as const,
    sentiment: await analyzeSentiment(content),
    tags: extractTags(content),
    isEdited: false,
    editHistory: []
  };
  
  return await addDoc(collection(db, 'journal_entries'), entry);
};
```

#### Module Journal Entry
```typescript
const createModuleEntry = async (content: string, moduleId: string, submoduleId: string) => {
  const entry = {
    userId: user.id,
    content,
    wordCount: calculateWordCount(content),
    entryType: 'module_journal' as const,
    moduleId,
    submoduleId,
    sentiment: await analyzeSentiment(content),
    tags: extractModuleTags(moduleId, submoduleId),
    isEdited: false,
    editHistory: []
  };
  
  const docRef = await addDoc(collection(db, 'journal_entries'), entry);
  
  // Update module progress
  await updateModuleProgress(user.id, moduleId, submoduleId, {
    status: 'in_progress',
    journalEntryId: docRef.id,
    wordCount: entry.wordCount
  });
  
  return docRef;
};
```

### Read Operations

#### Load User Entries
```typescript
const loadUserEntries = async (userId: string, type?: 'freeform' | 'module_journal') => {
  let query = query(
    collection(db, 'journal_entries'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  if (type) {
    query = query(query, where('entryType', '==', type));
  }
  
  const snapshot = await getDocs(query);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

#### Load Module Progress
```typescript
const loadModuleProgress = async (userId: string, moduleId: string) => {
  const doc = await getDoc(doc(db, 'module_progress', `${userId}_${moduleId}`));
  return doc.exists() ? doc.data() : createDefaultProgress(userId, moduleId);
};
```

### Update Operations

#### Update Journal Entry
```typescript
const updateJournalEntry = async (entryId: string, newContent: string) => {
  const entryRef = doc(db, 'journal_entries', entryId);
  const entry = await getDoc(entryRef);
  
  if (!entry.exists()) throw new Error('Entry not found');
  
  const updatedEntry = {
    ...entry.data(),
    content: newContent,
    wordCount: calculateWordCount(newContent),
    updatedAt: serverTimestamp(),
    isEdited: true,
    editHistory: [
      ...entry.data().editHistory || [],
      {
        timestamp: serverTimestamp(),
        previousContent: entry.data().content
      }
    ]
  };
  
  await updateDoc(entryRef, updatedEntry);
  return updatedEntry;
};
```

#### Update Module Progress
```typescript
const updateModuleProgress = async (
  userId: string, 
  moduleId: string, 
  submoduleId: string, 
  progress: Partial<SubmoduleProgress>
) => {
  const progressRef = doc(db, 'module_progress', `${userId}_${moduleId}`);
  
  await updateDoc(progressRef, {
    [`submoduleProgress.${submoduleId}`]: progress,
    lastAccessed: serverTimestamp()
  });
};
```

### Delete Operations

#### Delete Journal Entry
```typescript
const deleteJournalEntry = async (entryId: string) => {
  await deleteDoc(doc(db, 'journal_entries', entryId));
};
```

## LLM Integration

### Sentiment Analysis
```typescript
const analyzeSentiment = async (content: string) => {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: content })
    });
    
    const result = await response.json();
    const sentiment = result[0].label;
    
    return sentiment === 'LABEL_0' ? 'negative' : 
           sentiment === 'LABEL_1' ? 'neutral' : 'positive';
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    return 'neutral';
  }
};
```

### Follow-up Prompt Generation
```typescript
const generateFollowUpPrompt = async (userResponse: string, originalPrompt: string) => {
  try {
    const systemPrompt = `You are a compassionate journaling assistant for eating disorder recovery. 
    Based on the user's response to a journaling prompt, generate a thoughtful follow-up question 
    that encourages deeper reflection. Keep questions open-ended and supportive.`;
    
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `${systemPrompt}\n\nOriginal Prompt: ${originalPrompt}\n\nUser Response: ${userResponse}\n\nFollow-up Question:`,
        parameters: {
          max_length: 100,
          temperature: 0.7
        }
      })
    });
    
    const result = await response.json();
    return result[0].generated_text;
    
  } catch (error) {
    console.error('Follow-up prompt generation failed:', error);
    return getFallbackFollowUpPrompt();
  }
};
```

## User Experience Features

### Auto-save Functionality
```typescript
const useAutoSave = (content: string, saveFunction: (content: string) => Promise<void>) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content.trim().length > 0) {
        saveFunction(content);
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(timeoutId);
  }, [content, saveFunction]);
};
```

### Word Count Calculation
```typescript
const calculateWordCount = (content: string): number => {
  return content
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
};
```

### Progress Tracking
```typescript
const calculateModuleProgress = (submoduleProgress: SubmoduleProgress): number => {
  const totalSubmodules = Object.keys(submoduleProgress).length;
  const completedSubmodules = Object.values(submoduleProgress)
    .filter(progress => progress.status === 'completed').length;
  
  return Math.round((completedSubmodules / totalSubmodules) * 100);
};
```

## Error Handling

### Network Error Handling
```typescript
const handleNetworkError = (error: any, operation: string) => {
  console.error(`${operation} failed:`, error);
  
  if (error.code === 'unavailable') {
    // Queue operation for retry when online
    queueOfflineOperation(operation, error.data);
    return 'Operation queued for when you\'re back online';
  }
  
  return 'Something went wrong. Please try again.';
};
```

### Validation Error Handling
```typescript
const validateJournalEntry = (content: string, requirements?: WordCountRequirements) => {
  const errors: string[] = [];
  
  if (!content.trim()) {
    errors.push('Please write something before saving.');
  }
  
  if (requirements) {
    const wordCount = calculateWordCount(content);
    if (wordCount < requirements.minimum) {
      errors.push(`Please write at least ${requirements.minimum} words.`);
    }
  }
  
  return errors;
};
```

## Performance Optimizations

### Debounced Word Count
```typescript
const useDebouncedWordCount = (content: string, delay: number = 500) => {
  const [wordCount, setWordCount] = useState(0);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setWordCount(calculateWordCount(content));
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [content, delay]);
  
  return wordCount;
};
```

### Caching Strategy
```typescript
const useCachedEntries = (userId: string) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadEntries = async () => {
      // Check cache first
      const cached = localStorage.getItem(`entries_${userId}`);
      if (cached) {
        setEntries(JSON.parse(cached));
        setLoading(false);
      }
      
      // Load fresh data
      const freshEntries = await loadUserEntries(userId);
      setEntries(freshEntries);
      localStorage.setItem(`entries_${userId}`, JSON.stringify(freshEntries));
      setLoading(false);
    };
    
    loadEntries();
  }, [userId]);
  
  return { entries, loading };
};
```

## Security Considerations

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /journal_entries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    match /module_progress/{progressId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Data Validation
```typescript
const validateEntryData = (data: any): boolean => {
  return (
    typeof data.content === 'string' &&
    data.content.length > 0 &&
    data.content.length <= 10000 && // Max 10k characters
    typeof data.wordCount === 'number' &&
    data.wordCount >= 0 &&
    ['freeform', 'module_journal'].includes(data.entryType)
  );
};
```

## Implementation Checklist

### Phase 1: Core Functionality
- [ ] Set up Firebase collections and security rules
- [ ] Implement basic CRUD operations for journal entries
- [ ] Add word count calculation and validation
- [ ] Implement auto-save functionality
- [ ] Add entry history and editing capabilities

### Phase 2: Module System
- [ ] Implement module progress tracking
- [ ] Add submodule completion logic
- [ ] Create module unlocking system
- [ ] Implement progress visualization
- [ ] Add module completion celebrations

### Phase 3: LLM Integration
- [ ] Set up HuggingFace API integration
- [ ] Implement sentiment analysis
- [ ] Add follow-up prompt generation
- [ ] Create fallback systems for API failures
- [ ] Add rate limiting and caching

### Phase 4: User Experience
- [ ] Add loading states and error handling
- [ ] Implement offline support
- [ ] Add search and filtering capabilities
- [ ] Create export functionality
- [ ] Add accessibility features

### Phase 5: Performance & Security
- [ ] Implement data caching strategies
- [ ] Add input validation and sanitization
- [ ] Set up monitoring and analytics
- [ ] Add crisis detection and support resources
- [ ] Implement data retention policies

## Testing Strategy

### Unit Tests
- [ ] Test word count calculation
- [ ] Test validation functions
- [ ] Test progress calculation
- [ ] Test error handling

### Integration Tests
- [ ] Test Firebase CRUD operations
- [ ] Test LLM API integration
- [ ] Test module progression logic
- [ ] Test offline functionality

### User Acceptance Tests
- [ ] Test journaling flow end-to-end
- [ ] Test module completion flow
- [ ] Test error recovery scenarios
- [ ] Test accessibility features

---

*This guide provides comprehensive implementation requirements for the journaling system in Interosight.* 