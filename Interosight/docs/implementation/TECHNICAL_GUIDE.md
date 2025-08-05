# Technical Implementation Guide

## Overview

This document provides technical implementation details for the Interosight journaling system, including service architecture, code patterns, and implementation strategies.

## Service Architecture

### 1. `journalService.ts` - Core Service Layer

**Purpose**: Centralized service for all Firebase/Firestore operations

**Key Functions**:

#### **Entry Management**
```typescript
// Create new journal entries
export const createModuleEntry = async (
  userId: string, 
  content: string, 
  moduleId: string, 
  submoduleId: string
): Promise<string>

export const createFreeformEntry = async (
  userId: string, 
  content: string
): Promise<string>

// Update existing entries
export const updateJournalEntry = async (
  entryId: string, 
  updates: Partial<JournalEntry>
): Promise<void>

// Load entries
export const loadUserEntries = async (
  userId: string, 
  entryType?: string
): Promise<JournalEntry[]>

export const loadSubmoduleEntries = async (
  userId: string, 
  moduleId: string, 
  submoduleId: string
): Promise<JournalEntry[]>

export const getJournalEntry = async (
  entryId: string
): Promise<JournalEntry>
```

#### **Progress Management**
```typescript
// Module progress operations
export const loadModuleProgress = async (
  userId: string, 
  moduleId: string
): Promise<ModuleProgress>

export const updateModuleProgress = async (
  userId: string, 
  moduleId: string, 
  submoduleId: string, 
  progress: SubmoduleProgress
): Promise<void>

export const checkModuleCompletion = async (
  userId: string, 
  moduleId: string
): Promise<boolean>
```

#### **AI Integration (Future)**
```typescript
// Sentiment analysis and follow-up reprompts
export const generateFollowUpReprompt = async (
  userResponse: string, 
  originalPrompt: string
): Promise<string>

export const analyzeSentiment = async (
  content: string
): Promise<'positive' | 'negative' | 'neutral'>

// Track discarded reprompts for model training
export const trackDiscardedReprompt = async (
  userId: string,
  moduleId: string,
  submoduleId: string,
  discardedReprompt: string,
  context: {
    originalPrompt: string;
    userResponse: string;
    shuffleCount: number;
    reason: 'shuffle' | 'timeout'; // shuffle == reject
    chainPosition: number;
    parentEntryId: string;
  }
): Promise<void>

// Handle soft deletes for training data preservation
export const softDeleteJournalEntry = async (
  entryId: string,
  reason: string
): Promise<void>

// Handle edits with original content preservation
export const updateJournalEntryWithPreservation = async (
  entryId: string,
  newContent: string,
  originalContent: string
): Promise<void>
```

### 2. Data Validation & Utilities

#### **Input Validation**
```typescript
export const validateJournalEntry = (
  content: string, 
  requirements: WordCountRequirement
): string[]

export const calculateWordCount = (text: string): number

export const sanitizeContent = (content: string): string
```

#### **Progress Calculations**
```typescript
export const calculateModuleProgress = (
  submoduleProgress: Record<string, SubmoduleProgress>
): number

export const getModuleStatus = (
  progress: ModuleProgress | null
): 'locked' | 'current' | 'completed'
```

## Component Architecture

### 1. Screen Components

#### **ModuleScreen.tsx**
```typescript
interface ModuleScreenProps {
  moduleId: string;
  setCurrentScreen?: (screen: { screen: string; moduleId?: string }) => void;
}

const ModuleScreen: React.FC<ModuleScreenProps> = ({ moduleId, setCurrentScreen }) => {
  // State management
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [journalContent, setJournalContent] = useState('');
  const [responseState, setResponseState] = useState<'empty' | 'drafting' | 'ready' | 'saved' | 'editing'>('empty');
  
  // Core functions
  const handleSave = async () => { /* Save current response */ };
  const handleReprompt = async () => { 
    /* Generate AI follow-up - only works after saving */
    if (savedEntries.length === 0) {
      setError('Please save your response first before requesting a follow-up prompt.');
      return;
    }
    // Use last saved response for context
    const textToReprompt = savedEntries[savedEntries.length - 1].content;
    // Generate follow-up prompt...
  };
  const handleEditResponse = (entry: JournalEntry) => { /* Load entry for editing */ };
  const handleUpdateResponse = async () => { /* Update edited entry */ };
  
  // Validation logic
  const canSave = wordCount >= currentSubmodule.wordCountRequirement.minimum;
  const canReprompt = savedEntries.length > 0 && !isGeneratingReprompt; // Only after saving
  
  // UI rendering with conversation history
  return (
    <div>
      {/* Conversation history */}
      {savedEntries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onEdit={handleEditResponse} />
      ))}
      
      {/* Input area */}
      <TextArea 
        value={journalContent}
        onChange={handleTextChange}
        placeholder={getPlaceholder()}
      />
      
      {/* Action buttons */}
      <ActionButtons 
        onSave={handleSave}
        onReprompt={handleReprompt}
        canSave={canSave}
        canReprompt={canReprompt}
      />
    </div>
  );
};
```

#### **FreeformJournalScreen.tsx**
```typescript
const FreeformJournalScreen: React.FC = () => {
  const [journalContent, setJournalContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    // Simple save without module context
    const entryId = await createFreeformEntry(currentUser.uid, journalContent);
    setJournalContent('');
    setWordCount(0);
  };
  
  return (
    <div>
      <TextArea 
        value={journalContent}
        onChange={handleTextChange}
        placeholder="Write your thoughts..."
      />
      <WordCount count={wordCount} />
      <SaveButton onClick={handleSave} disabled={!canSave} />
    </div>
  );
};
```

#### **HistoryScreen.tsx**
```typescript
const HistoryScreen: React.FC = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentUser?.uid) {
      loadEntries();
    }
  }, [currentUser?.uid]);
  
  const loadEntries = async () => {
    const entries = await loadUserEntries(currentUser!.uid);
    setJournalEntries(entries);
    setLoading(false);
  };
  
  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {journalEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### 2. Shared Components

#### **EntryCard.tsx**
```typescript
interface EntryCardProps {
  entry: JournalEntry;
  onEdit?: (entry: JournalEntry) => void;
  showEditButton?: boolean;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onEdit, showEditButton = true }) => {
  const isAIPrompt = entry.tags?.includes('ai-prompt');
  
  return (
    <div className={`rounded-lg p-4 border-l-4 ${
      isAIPrompt 
        ? 'bg-blue-50 border-blue-500' 
        : 'bg-gray-50 border-primary-500'
    }`}>
      <div className="flex justify-between items-start">
        <span className="text-sm text-gray-500">
          {isAIPrompt ? 'AI Prompt' : `Response ${entry.id}`}
        </span>
        <span className="text-xs text-gray-400">
          {formatDate(entry.createdAt)}
        </span>
      </div>
      
      <p className="text-gray-800 whitespace-pre-wrap mt-2">
        {entry.content}
      </p>
      
      {showEditButton && !isAIPrompt && onEdit && (
        <button 
          onClick={() => onEdit(entry)}
          className="text-sm text-blue-600 hover:text-blue-800 mt-2"
        >
          Edit
        </button>
      )}
    </div>
  );
};
```

## State Management Patterns

### 1. Local State Management

#### **Module Screen State**
```typescript
// Core state
const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
const [journalContent, setJournalContent] = useState('');
const [wordCount, setWordCount] = useState(0);
const [responseState, setResponseState] = useState<'empty' | 'drafting' | 'ready' | 'saved' | 'editing'>('empty');

// UI state
const [isSaving, setIsSaving] = useState(false);
const [isGeneratingReprompt, setIsGeneratingReprompt] = useState(false);
const [showReprompt, setShowReprompt] = useState(false);
const [repromptText, setRepromptText] = useState('');
const [error, setError] = useState<string | null>(null);

// Computed state
const canSave = journalContent.trim().length > 0 && wordCount >= minWords;
const canReprompt = savedEntries.length > 0 || journalContent.trim().length > 0;
```

#### **State Update Patterns**
```typescript
// Add new entry to conversation
const handleSave = async () => {
  const entryId = await createModuleEntry(/* ... */);
  const newEntry = await getJournalEntry(entryId);
  setSavedEntries(prev => [...prev, newEntry]);
  setJournalContent('');
  setWordCount(0);
  setResponseState('empty');
};

// Load conversation history
const loadCurrentSubmoduleResponses = async () => {
  const entries = await loadSubmoduleEntries(userId, moduleId, submoduleId);
  setSavedEntries(entries);
  setResponseState(entries.length > 0 ? 'saved' : 'empty');
};
```

### 2. Global State (AuthContext)

#### **Authentication State**
```typescript
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

## Error Handling Patterns

### 1. Service Layer Error Handling

#### **Try-Catch with Fallbacks**
```typescript
export const loadSubmoduleEntries = async (
  userId: string, 
  moduleId: string, 
  submoduleId: string
): Promise<JournalEntry[]> => {
  try {
    const q = query(
      collection(db, 'journal_entries'),
      where('userId', '==', userId),
      where('moduleId', '==', moduleId),
      where('submoduleId', '==', submoduleId)
    );
    
    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push(/* transform data */);
    });
    
    entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return entries;
  } catch (error) {
    console.error('Error loading submodule entries:', error);
    return []; // Return empty array as fallback
  }
};
```

#### **Validation Error Handling**
```typescript
const handleSave = async () => {
  const errors = validateJournalEntry(journalContent, currentSubmodule.wordCountRequirement);
  
  if (errors.length > 0) {
    setError(errors[0]);
    return;
  }
  
  try {
    setIsSaving(true);
    // ... save logic
    setError(null);
  } catch (error) {
    console.error('Error saving entry:', error);
    setError('Failed to save entry. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
```

### 2. UI Error Display

#### **Error State Management**
```typescript
const [error, setError] = useState<string | null>(null);

// Display error in UI
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}

// Clear error on successful operations
const handleSave = async () => {
  try {
    // ... save logic
    setError(null); // Clear error on success
  } catch (error) {
    setError('Failed to save entry. Please try again.');
  }
};
```

## Performance Optimization

### 1. Query Optimization

#### **Avoid Complex Indexes**
```typescript
// Requires composite index
const q = query(
  collection(db, 'journal_entries'),
  where('userId', '==', userId),
  where('entryType', '==', 'module_journal'),
  orderBy('createdAt', 'desc')
);

// No composite index needed
const q = query(
  collection(db, 'journal_entries'),
  where('userId', '==', userId),
  where('moduleId', '==', moduleId),
  where('submoduleId', '==', submoduleId)
);
// Sort in JavaScript
entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
```

#### **Efficient Data Loading**
```typescript
// Load only necessary fields
const q = query(
  collection(db, 'journal_entries'),
  where('userId', '==', userId),
  select('id', 'content', 'createdAt', 'entryType') // Only load needed fields
);
```

### 2. Component Optimization

#### **Memoization for Expensive Calculations**
```typescript
const canSave = useMemo(() => {
  return journalContent.trim().length > 0 && 
         wordCount >= currentSubmodule?.wordCountRequirement?.minimum;
}, [journalContent, wordCount, currentSubmodule]);

const canReprompt = useMemo(() => {
  return savedEntries.length > 0 || journalContent.trim().length > 0;
}, [savedEntries.length, journalContent]);
```

#### **Debounced Updates**
```typescript
const debouncedWordCount = useMemo(
  () => debounce((text: string) => {
    setWordCount(calculateWordCount(text));
  }, 300),
  []
);
```

## Testing Strategies

### 1. Unit Testing

#### **Service Layer Testing**
```typescript
describe('journalService', () => {
  describe('createModuleEntry', () => {
    it('should create a new journal entry', async () => {
      const mockUserId = 'test-user';
      const mockContent = 'Test content';
      const mockModuleId = 'test-module';
      const mockSubmoduleId = 'test-submodule';
      
      const entryId = await createModuleEntry(
        mockUserId, 
        mockContent, 
        mockModuleId, 
        mockSubmoduleId
      );
      
      expect(entryId).toBeDefined();
      // Verify entry was created in Firestore
    });
  });
});
```

#### **Component Testing**
```typescript
describe('ModuleScreen', () => {
  it('should save entry when save button is clicked', async () => {
    render(<ModuleScreen moduleId="test-module" />);
    
    const textArea = screen.getByPlaceholderText(/write your response/i);
    fireEvent.change(textArea, { target: { value: 'Test response' } });
    
    const saveButton = screen.getByText(/save response/i);
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });
  });
});
```

### 2. Integration Testing

#### **End-to-End Flow Testing**
```typescript
describe('Module Journaling Flow', () => {
  it('should complete full reprompt flow', async () => {
    // 1. Load module screen
    // 2. Write initial response
    // 3. Click reprompt
    // 4. Verify AI prompt is generated
    // 5. Add AI prompt to conversation
    // 6. Verify both entries are saved
    // 7. Return to module and verify history loads
  });
});
```

## Deployment Considerations

### 1. Environment Configuration

#### **Firebase Configuration**
```typescript
// firebase.ts
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

#### **Security Rules Deployment**
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firebase configuration
firebase deploy --only hosting
```

### 2. Monitoring & Analytics

#### **Error Tracking**
```typescript
// Track errors for monitoring
const handleError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);
  // Send to error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // reportError(error, context);
  }
};
```

#### **Performance Monitoring**
```typescript
// Track key user actions
const trackUserAction = (action: string, metadata?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // analytics.track(action, metadata);
  }
};
```

This technical implementation guide provides a comprehensive overview of the code architecture, patterns, and best practices used in the Interosight journaling system. 