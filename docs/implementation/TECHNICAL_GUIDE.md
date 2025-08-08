# Technical Implementation Guide

## Overview

This document provides technical implementation details for the Interosight journaling system, including service architecture, code patterns, and implementation strategies. The system now includes comprehensive AI integration, history management, and session-based data isolation.

## Service Architecture

### 1. `googleAIService.ts` - AI Integration Layer

**Purpose**: Centralized service for Google AI (Gemini) integration

**Key Functions**:

#### **Follow-up Prompt Generation**
```typescript
// Generate contextual follow-up prompts
export const generateFollowUpPrompt = async ({
  userResponse: string,
  originalPrompt: string,
  previousPrompts?: Array<{ content: string; type: 'ai_prompt' | 'module_journal' }>
}: GeneratePromptParams): Promise<string>

// Generate clinical summaries for entries
export const generateEntrySummary = async ({
  content: string,
  entryType: 'freeform' | 'module' | 'meal' | 'behavior',
  metadata?: {
    mealType?: string;
    location?: string;
    socialContext?: string;
    satietyPre?: number;
    satietyPost?: number;
    emotionPre?: string[];
    emotionPost?: string[];
    affectPre?: number;
    affectPost?: number;
  }
}: GenerateSummaryParams): Promise<string>
```

#### **AI Configuration**
```typescript
// Model configuration
const modelConfig = {
  model: "gemini-3-12b-it",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 200,
  }
};

// Clinical prompt templates
const CLINICAL_PROMPTS = {
  freeform: {
    systemPrompt: `You are a clinical assistant analyzing journal entries...`,
    userPrompt: `Please provide an objective, insight-focused summary...`
  },
  meal: {
    systemPrompt: `You are a clinical assistant analyzing meal log entries...`,
    userPrompt: `Please provide an objective, insight-focused summary...`
  },
  behavior: {
    systemPrompt: `You are a clinical assistant analyzing behavior log entries...`,
    userPrompt: `Please provide an objective, insight-focused summary...`
  }
};
```

### 2. `freeformService.ts` - Freeform Journaling Service

**Purpose**: Manage freeform journaling with session isolation

**Key Functions**:

#### **Session Management**
```typescript
// Create freeform entry with session isolation
export const createFreeformEntry = async (
  userId: string, 
  content: string, 
  isAIPrompt: boolean = false, 
  parentEntryId?: string, 
  sessionId?: string
): Promise<string>

// Get entries for specific session
export const getFreeformEntries = async (
  userId: string, 
  sessionId?: string
): Promise<FreeformEntry[]>

// Generate session ID
export const generateSessionId = (): string => `session_${Date.now()}`
```

#### **Data Models**
```typescript
interface FreeformEntry {
  id: string;
  userId: string;
  content: string;
  sessionId: string;                      // Session isolation
  chainPosition: number;
  parentEntryId?: string;
  conversationThread: ConversationMessage[];
  llmSummary?: string;                    // AI-generated clinical summary
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted: boolean;
}

interface ConversationMessage {
  id: string;
  content: string;
  type: 'ai_prompt' | 'freeform_journal';
  timestamp: Timestamp;
}
```

### 3. `moduleService.ts` - Module System Service

**Purpose**: Manage structured module journaling with AI integration

**Key Functions**:

#### **Entry Management**
```typescript
// Create module entry with AI summary
export const createModuleEntry = async (
  userId: string, 
  moduleId: string, 
  submoduleId: string, 
  content: string, 
  isAIPrompt: boolean, 
  context?: {
    originalPrompt?: string;
    previousPrompts?: Array<{ content: string; type: string }>;
  }
): Promise<string>

// Get module entries with conversation threads
export const getModuleEntries = async (
  userId: string, 
  moduleId: string, 
  submoduleId: string
): Promise<JournalEntry[]>

// Update module progress
export const updateModuleProgress = async (
  userId: string, 
  moduleId: string, 
  submoduleId: string, 
  progress: SubmoduleProgress
): Promise<void>
```

#### **Data Models**
```typescript
interface JournalEntry {
  id: string;
  userId: string;
  moduleId: string;
  submoduleId: string;
  content: string;
  type: 'user_response' | 'ai_prompt';
  chainPosition: number;
  parentEntryId?: string;
  conversationThread: ConversationMessage[];
  llmSummary?: string;                    // AI-generated clinical summary
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ModuleProgress {
  moduleId: string;
  submodules: { [submoduleId: string]: SubmoduleProgress };
  lastAccessed: Timestamp;
  unlockedAt?: Timestamp;
  completedAt?: Timestamp;
}
```

### 4. `firebaseService.ts` - Activity Logging Service

**Purpose**: Manage meal and behavior logging with AI summaries

**Key Functions**:

#### **Meal Logging**
```typescript
// Create meal log with AI summary
export const createMealLog = async (log: MealLog): Promise<string>

// Get meal logs with summaries
export const getMealLogs = async (userId: string): Promise<MealLog[]>

// Data model
interface MealLog {
  id: string;
  userId: string;
  mealType: string;
  description: string;
  satietyPre: number;                    // Hunger level before (1-10)
  satietyPost: number;                   // Satiety level after (1-10)
  emotionPre: string[];                  // Emotions before eating
  emotionPost: string[];                 // Emotions after eating
  affectPre: number;                     // General affect before (1-10)
  affectPost: number;                    // General affect after (1-10)
  location: string;                      // Physical location
  socialContext: string;                 // Social setting
  llmSummary?: string;                   // AI-generated clinical summary
  createdAt: Timestamp;
}
```

#### **Behavior Logging**
```typescript
// Create behavior log with AI summary
export const createBehaviorLog = async (log: BehaviorLog): Promise<string>

// Get behavior logs with summaries
export const getBehaviorLogs = async (userId: string): Promise<BehaviorLog[]>

// Data model
interface BehaviorLog {
  id: string;
  userId: string;
  description: string;
  emotionPre: string[];                  // Emotions before behavior
  emotionPost: string[];                 // Emotions after behavior
  affectPre: number;                     // General affect before (1-10)
  affectPost: number;                    // General affect after (1-10)
  llmSummary?: string;                   // AI-generated clinical summary
  createdAt: Timestamp;
}
```

### 5. `historyService.ts` - History Aggregation Service

**Purpose**: Comprehensive history management with AI summaries

**Key Functions**:

#### **History Aggregation**
```typescript
// Get all user history with AI summaries
export const getAllUserHistory = async (
  userId: string
): Promise<GroupedHistoryEntries[]>

// Generate missing summaries for existing entries
export const generateMissingSummaries = async (
  entries: HistoryEntry[]
): Promise<void>

// Data models
interface HistoryEntry {
  id: string;
  type: 'freeform' | 'module' | 'meal' | 'behavior';
  title: string;                         // Formatted date/time
  description: string;                   // Entry type label
  content: string;                       // Original content
  llmSummary?: string;                   // AI-generated summary
  createdAt: Date;
  metadata: {
    wordCount: number;
    emotions?: string[];
    moduleId?: string;
    mealType?: string;
    location?: string;
    socialContext?: string;
    satietyPre?: number;
    satietyPost?: number;
    emotionPre?: string[];
    emotionPost?: string[];
    affectPre?: number;
    affectPost?: number;
    conversationThread?: ConversationMessage[];
  };
}

interface GroupedHistoryEntries {
  date: string;                          // Formatted date
  entries: HistoryEntry[];
}
```

## Implementation Patterns

### 1. AI Summary Generation Pattern

```typescript
// Efficient summary generation at entry creation
const createEntryWithSummary = async (entryData: EntryData) => {
  try {
    // Create entry first
    const entryId = await createEntry(entryData);
    
    // Generate AI summary
    const summary = await generateEntrySummary({
      content: entryData.content,
      entryType: entryData.type,
      metadata: entryData.metadata
    });
    
    // Update entry with summary
    await updateEntry(entryId, { llmSummary: summary });
    
    return entryId;
  } catch (error) {
    console.error('Failed to create entry with summary:', error);
    // Fallback: create entry without summary
    return await createEntry(entryData);
  }
};
```

### 2. Session Isolation Pattern

```typescript
// Session-based data isolation
const useFreeformSession = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [entries, setEntries] = useState<FreeformEntry[]>([]);
  
  useEffect(() => {
    // Generate new session ID on component mount
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    setEntries([]); // Start fresh each time
  }, []);
  
  const loadSessionEntries = async () => {
    if (!sessionId) return;
    const sessionEntries = await getFreeformEntries(userId, sessionId);
    setEntries(sessionEntries);
  };
  
  const saveEntry = async (content: string) => {
    const entryId = await createFreeformEntry(userId, content, false, undefined, sessionId);
    await loadSessionEntries();
    return entryId;
  };
  
  return { sessionId, entries, saveEntry, loadSessionEntries };
};
```

### 3. History Aggregation Pattern

```typescript
// Efficient history aggregation with in-memory filtering
const getAllUserHistory = async (userId: string): Promise<GroupedHistoryEntries[]> => {
  // Fetch all entry types in parallel
  const [freeformEntries, moduleEntries, mealLogs, behaviorLogs] = await Promise.all([
    getFreeformEntries(userId),
    getModuleEntries(userId),
    getMealLogs(userId),
    getBehaviorLogs(userId)
  ]);
  
  // Combine and normalize data
  const allEntries = [
    ...freeformEntries.map(entry => ({
      ...entry,
      type: 'freeform' as const,
      title: formatEntryTitle(entry.createdAt),
      description: 'Freeform Journal'
    })),
    ...moduleEntries.map(entry => ({
      ...entry,
      type: 'module' as const,
      title: formatEntryTitle(entry.createdAt),
      description: 'Module Entry'
    })),
    ...mealLogs.map(log => ({
      ...log,
      type: 'meal' as const,
      title: formatEntryTitle(log.createdAt),
      description: 'Meal Log'
    })),
    ...behaviorLogs.map(log => ({
      ...log,
      type: 'behavior' as const,
      title: formatEntryTitle(log.createdAt),
      description: 'Behavior Log'
    }))
  ];
  
  // Group by date
  return groupEntriesByDate(allEntries);
};
```

### 4. Error Handling Pattern

```typescript
// Comprehensive error handling with fallbacks
const handleAIError = async (operation: () => Promise<any>, fallback: any) => {
  try {
    return await operation();
  } catch (error) {
    console.error('AI operation failed:', error);
    return fallback;
  }
};

// Usage in summary generation
const generateSummaryWithFallback = async (content: string, entryType: string) => {
  return await handleAIError(
    () => generateEntrySummary({ content, entryType }),
    content.substring(0, 100) + '...' // Fallback preview
  );
};
```

## Performance Optimizations

### 1. Query Optimization

```typescript
// Avoid composite indexes with in-memory filtering
const getFilteredEntries = async (userId: string) => {
  // Fetch all entries (simple query)
  const entries = await getDocs(query(
    collection(db, 'users', userId, 'entries'),
    orderBy('createdAt', 'desc')
  ));
  
  // Filter in-memory
  return entries.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(entry => !entry.isDeleted);
};
```

### 2. Lazy Loading

```typescript
// Progressive data loading
const useHistoryData = (timeframe: string) => {
  const [data, setData] = useState<GroupedHistoryEntries[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const historyData = await getAllUserHistory(userId);
        const filteredData = filterByTimeframe(historyData, timeframe);
        setData(filteredData);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [timeframe]);
  
  return { data, loading };
};
```

### 3. Caching Strategy

```typescript
// Intelligent caching for frequently accessed data
const useCachedData = <T>(key: string, fetcher: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
    }
    
    fetcher().then(result => {
      setData(result);
      localStorage.setItem(key, JSON.stringify(result));
      setLoading(false);
    });
  }, [key]);
  
  return { data, loading };
};
```

## Security Considerations

### 1. Data Access Control

```typescript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 2. AI Safety Protocols

```typescript
// Crisis detection and safety measures
const detectCrisisKeywords = (content: string): boolean => {
  const crisisKeywords = ['suicide', 'kill myself', 'want to die', 'end it all'];
  return crisisKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
};

const generateSafeResponse = (content: string) => {
  if (detectCrisisKeywords(content)) {
    return {
      response: "I'm concerned about what you're sharing. Please reach out to a crisis helpline immediately: 988 or 1-800-273-8255. You're not alone, and help is available 24/7.",
      requiresCrisisIntervention: true
    };
  }
  // Normal response generation
};
```

## Testing Strategies

### 1. Unit Testing

```typescript
// Test AI summary generation
describe('generateEntrySummary', () => {
  it('should generate clinical summaries for freeform entries', async () => {
    const content = 'I struggled with my eating disorder today...';
    const summary = await generateEntrySummary({
      content,
      entryType: 'freeform'
    });
    
    expect(summary).toBeDefined();
    expect(summary.length).toBeLessThan(200);
    expect(summary).toContain('clinical');
  });
});
```

### 2. Integration Testing

```typescript
// Test complete entry creation flow
describe('Entry Creation Flow', () => {
  it('should create entry with AI summary', async () => {
    const entryData = {
      userId: 'test-user',
      content: 'Test entry content',
      type: 'freeform'
    };
    
    const entryId = await createFreeformEntry(
      entryData.userId,
      entryData.content,
      false,
      undefined,
      'test-session'
    );
    
    const entry = await getFreeformEntry(entryId);
    expect(entry.llmSummary).toBeDefined();
    expect(entry.sessionId).toBe('test-session');
  });
});
```

## Deployment Considerations

### 1. Environment Configuration

```typescript
// Environment variables
const config = {
  googleAI: {
    apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY,
    model: 'gemini-3-12b-it'
  },
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
  }
};
```

### 2. Performance Monitoring

```typescript
// Track key performance indicators
const trackPerformance = {
  pageLoadTime: (page: string, loadTime: number) => {
    console.log(`Page load time for ${page}: ${loadTime}ms`);
  },
  
  aiResponseTime: (entryType: string, responseTime: number) => {
    console.log(`AI response time for ${entryType}: ${responseTime}ms`);
  },
  
  dataSyncTime: (operation: string, syncTime: number) => {
    console.log(`Data sync time for ${operation}: ${syncTime}ms`);
  }
};
```

This technical implementation guide provides a comprehensive overview of the current system architecture, including AI integration, session management, and performance optimizations. The system is designed to be scalable, secure, and maintainable while providing excellent user experience. 