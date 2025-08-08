# Database Structure

## Overview

This document outlines the Firestore database structure for Interosight, a therapeutic journaling application. The structure is designed to support:
1. Progressive module-based learning
2. AI-assisted journaling with follow-up prompts and summaries
3. Freeform journaling with session isolation
4. Activity and emotion tracking with pre/post data
5. Comprehensive history aggregation
6. Progress tracking and module unlocking

## Core Collections

```typescript
users/
├── {userId}/
    ├── profile/                           # User profile and preferences
    │   ├── email: string
    │   ├── displayName?: string
    │   ├── createdAt: Timestamp
    │   ├── lastActive: Timestamp
    │   ├── preferences: UserPreferences
    │   └── privacySettings: PrivacySettings
    │
    ├── module_progress/                   # Module progress tracking
    │   ├── {moduleId}/                    # e.g., "introduction"
    │   │   ├── submodules: {             # Map of submodule progress
    │   │   │   [submoduleId]: {
    │   │   │     status: string          # 'not_started' | 'in_progress' | 'completed'
    │   │   │     currentPosition: number # Position in the entry chain
    │   │   │     completedAt?: Timestamp
    │   │   │   }
    │   │   │ }
    │   │   ├── lastAccessed: Timestamp
    │   │   ├── unlockedAt?: Timestamp    # When module became available
    │   │   └── completedAt?: Timestamp
    │   └── {moduleId2}/...
    │
    ├── modules/                           # Module content and entries
    │   ├── {moduleId}/
    │   │   └── submodules/
    │   │       ├── {submoduleId}/
    │   │       │   └── entries/          # Chain of prompts and responses
    │   │       │       ├── {entryId1}    # User response or AI prompt
    │   │       │       └── {entryId2}
    │   │       └── {submoduleId2}/...
    │   └── {moduleId2}/...
    │
    ├── freeform_entries/                  # Freeform journal entries with session isolation
    │   └── {entryId}/
    │       ├── content: string
    │       ├── type: 'freeform'
    │       ├── sessionId: string         # Session isolation for data integrity
    │       ├── chainPosition: number     # Position in conversation chain
    │       ├── parentEntryId?: string    # Links to previous entry in chain
    │       ├── conversationThread: ConversationMessage[]
    │       ├── llmSummary?: string       # AI-generated clinical summary
    │       ├── createdAt: Timestamp
    │       ├── updatedAt: Timestamp
    │       └── isDeleted: boolean
    │
    ├── meal_logs/                         # Meal and eating behavior tracking
    │   └── {logId}/
    │       ├── mealType: string
    │       ├── description: string
    │       ├── satietyPre: number        # Hunger level before eating (1-10)
    │       ├── satietyPost: number       # Satiety level after (1-10)
    │       ├── emotionPre: string[]      # Emotions before eating
    │       ├── emotionPost: string[]     # Emotions after eating
    │       ├── affectPre: number         # General affect before (1-10)
    │       ├── affectPost: number        # General affect after (1-10)
    │       ├── socialContext: string     # Social setting during meal
    │       ├── location: string          # Physical location
    │       ├── llmSummary?: string       # AI-generated clinical summary
    │       └── createdAt: Timestamp
    │
    └── behavior_logs/                     # General behavior tracking
        └── {logId}/
            ├── description: string
            ├── emotionPre: string[]       # Emotions before behavior
            ├── emotionPost: string[]      # Emotions after behavior
            ├── affectPre: number          # General affect before (1-10)
            ├── affectPost: number         # General affect after (1-10)
            ├── llmSummary?: string        # AI-generated clinical summary
            └── createdAt: Timestamp

# Legacy collections (for backward compatibility)
mealLogs/                                 # Legacy meal logs collection
└── {logId}/
    ├── userId: string
    ├── mealType: string
    ├── description: string
    ├── satietyPre: number
    ├── satietyPost: number
    ├── emotionPre: string[]
    ├── emotionPost: string[]
    ├── affectPre: number
    ├── affectPost: number
    ├── socialContext: string
    ├── location: string
    ├── llmSummary?: string
    └── createdAt: Timestamp

behaviorLogs/                             # Legacy behavior logs collection
└── {logId}/
    ├── userId: string
    ├── description: string
    ├── emotionPre: string[]
    ├── emotionPost: string[]
    ├── affectPre: number
    ├── affectPost: number
    ├── llmSummary?: string
    └── createdAt: Timestamp
```

## Data Models

### 1. Journal Entries
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
  type: 'ai_prompt' | 'module_journal' | 'freeform_journal';
  timestamp: Timestamp;
}
```

### 2. Activity Logs
```typescript
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

### 3. Module System
```typescript
interface Module {
  id: string;
  title: string;
  description: string;
  submodules: Submodule[];
  prerequisites?: string[];               // Required modules
  unlockedAt?: Timestamp;
  completedAt?: Timestamp;
}

interface Submodule {
  id: string;
  title: string;
  description: string;
  prompts: string[];                     // Journaling prompts
  wordCountRequirement: number;          // Minimum word count
  status: 'not_started' | 'in_progress' | 'completed';
  currentPosition: number;               // Position in entry chain
  completedAt?: Timestamp;
}

interface ModuleProgress {
  moduleId: string;
  submodules: { [submoduleId: string]: SubmoduleProgress };
  lastAccessed: Timestamp;
  unlockedAt?: Timestamp;
  completedAt?: Timestamp;
}

interface SubmoduleProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  currentPosition: number;
  completedAt?: Timestamp;
}
```

### 4. History Aggregation
```typescript
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

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data access control
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Profile data
      match /profile {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Module progress
      match /module_progress/{moduleId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Module entries
      match /modules/{moduleId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        match /submodules/{submoduleId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
          
          match /entries/{entryId} {
            allow read, write: if request.auth != null && request.auth.uid == userId;
          }
        }
      }
      
      // Freeform entries
      match /freeform_entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Meal logs
      match /meal_logs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Behavior logs
      match /behavior_logs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Legacy collections (for backward compatibility)
    match /mealLogs/{logId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /behaviorLogs/{logId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Indexing Strategy

### Required Indexes
```javascript
// For efficient history queries
// Collection: users/{userId}/freeform_entries
// Fields: createdAt (descending), isDeleted (ascending)

// Collection: users/{userId}/meal_logs  
// Fields: createdAt (descending)

// Collection: users/{userId}/behavior_logs
// Fields: createdAt (descending)

// Collection: mealLogs (legacy)
// Fields: userId (ascending), createdAt (descending)

// Collection: behaviorLogs (legacy)
// Fields: userId (ascending), createdAt (descending)
```

### Query Optimization
```typescript
// Efficient history aggregation
const getAllUserHistory = async (userId: string): Promise<GroupedHistoryEntries[]> => {
  // Fetch all entry types in parallel
  const [freeformEntries, moduleEntries, mealLogs, behaviorLogs] = await Promise.all([
    getFreeformEntries(userId),
    getModuleEntries(userId),
    getMealLogs(userId),
    getBehaviorLogs(userId)
  ]);
  
  // Combine and group by date in-memory
  const allEntries = [
    ...freeformEntries.map(entry => ({ ...entry, type: 'freeform' })),
    ...moduleEntries.map(entry => ({ ...entry, type: 'module' })),
    ...mealLogs.map(log => ({ ...log, type: 'meal' })),
    ...behaviorLogs.map(log => ({ ...log, type: 'behavior' }))
  ];
  
  return groupEntriesByDate(allEntries);
};
```

## Data Migration

### Legacy Data Support
```typescript
// Support for legacy meal logs
const getMealLogs = async (userId: string): Promise<MealLog[]> => {
  const [newLogs, legacyLogs] = await Promise.all([
    // New collection
    getDocs(query(
      collection(db, 'users', userId, 'meal_logs'),
      orderBy('createdAt', 'desc')
    )),
    // Legacy collection
    getDocs(query(
      collection(db, 'mealLogs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ))
  ]);
  
  return [
    ...newLogs.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    ...legacyLogs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  ];
};
```

## Performance Considerations

### 1. Query Optimization
- Use compound indexes for complex queries
- Implement in-memory filtering to avoid composite index requirements
- Batch operations for bulk data operations
- Use pagination for large datasets

### 2. Data Structure
- Keep documents under 1MB size limit
- Use subcollections for related data
- Implement proper data denormalization
- Use arrays sparingly (Firestore limitations)

### 3. Real-time Updates
- Use onSnapshot for real-time data
- Implement proper cleanup for listeners
- Handle offline scenarios gracefully
- Use optimistic updates for better UX

## Backup and Recovery

### 1. Data Export
```typescript
// Export user data for backup
const exportUserData = async (userId: string) => {
  const userData = {
    profile: await getUserProfile(userId),
    modules: await getAllModuleData(userId),
    freeformEntries: await getFreeformEntries(userId),
    mealLogs: await getMealLogs(userId),
    behaviorLogs: await getBehaviorLogs(userId)
  };
  
  return JSON.stringify(userData, null, 2);
};
```

### 2. Data Import
```typescript
// Import user data from backup
const importUserData = async (userId: string, data: string) => {
  const userData = JSON.parse(data);
  
  // Validate data structure
  if (!validateUserData(userData)) {
    throw new Error('Invalid data format');
  }
  
  // Import data in batches
  await Promise.all([
    importProfile(userId, userData.profile),
    importModules(userId, userData.modules),
    importEntries(userId, userData.freeformEntries),
    importLogs(userId, userData.mealLogs, userData.behaviorLogs)
  ]);
};
```

This database structure provides a robust foundation for the Interosight application, supporting all current features while maintaining backward compatibility and ensuring optimal performance for future scalability.