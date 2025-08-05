# Database Structure

## Overview

This document outlines the Firestore database structure for Interosight, a therapeutic journaling application. The structure is designed to support:
1. Progressive module-based learning
2. AI-assisted journaling with follow-up prompts
3. Freeform journaling
4. Activity and emotion tracking
5. Progress tracking and module unlocking

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
    ├── journal_entries/                   # Freeform journal entries
    │   └── {entryId}/
    │       ├── content: string
    │       ├── type: 'freeform'
    │       ├── createdAt: Timestamp
    │       ├── updatedAt: Timestamp
    │       ├── isEdited: boolean
    │       └── editHistory?: EditRecord[]
    │
    ├── meal_logs/                         # Meal and eating behavior tracking
    │   └── {logId}/
    │       ├── mealType: string
    │       ├── description: string
    │       ├── satietyPre: number
    │       ├── satietyPost: number
    │       ├── emotionPre: string[]
    │       ├── emotionPost: string[]
    │       ├── socialContext: string
    │       ├── locationContext: string
    │       └── createdAt: Timestamp
    │
    └── behavior_logs/                     # General behavior tracking
        └── {logId}/
            ├── description: string
            ├── emotionPre: string[]
            ├── emotionPost: string[]
            ├── affectPre: number
            ├── affectPost: number
            └── createdAt: Timestamp

```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /profile {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /module_progress/{moduleId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /modules/{moduleId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        match /submodules/{submoduleId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
          
          match /entries/{entryId} {
            allow read, write: if request.auth != null && request.auth.uid == userId;
          }
        }
      }
      
      match /journal_entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /meal_logs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /behavior_logs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Data Access Patterns

### Module Progress
```typescript
// Load module progress
const progressRef = doc(db, 'users', userId, 'module_progress', moduleId);

// Update progress
await setDoc(progressRef, {
  submodules: {
    [submoduleId]: {
      status: 'completed',
      currentPosition: 2,
      completedAt: Timestamp.now()
    }
  },
  lastAccessed: Timestamp.now()
}, { merge: true });
```

### Journal Entries
```typescript
// Create module entry
const entryRef = collection(db, 'users', userId, 'modules', moduleId, 'submodules', submoduleId, 'entries');
await addDoc(entryRef, {
  content: string,
  type: 'module_journal',
  chainPosition: number,
  parentEntryId?: string,
  isAIPrompt: boolean,
  createdAt: Timestamp.now()
});

// Load entries chain
const entriesRef = collection(db, 'users', userId, 'modules', moduleId, 'submodules', submoduleId, 'entries');
const q = query(entriesRef, orderBy('chainPosition', 'asc'));
```

## Implementation Notes

1. **Module Progress**
   - Store progress separately from content
   - Use merge operations for atomic updates
   - Track completion status per submodule

2. **Entry Chains**
   - Maintain parent-child relationships
   - Store chain position for ordering
   - Distinguish between user responses and AI prompts

3. **Module Unlocking**
   - Introduction module always unlocked
   - Unlock next module on completion
   - Track unlock timestamps

4. **Data Validation**
   - Validate content length and format
   - Ensure required fields
   - Maintain data integrity in chains

5. **Performance Considerations**
   - Use shallow queries where possible
   - Implement pagination for long chains
   - Cache frequently accessed data

## Future Considerations

1. **Analytics**
   - User engagement metrics
   - Response patterns
   - Emotional trend analysis

2. **Data Export**
   - Journal entry export
   - Progress reports
   - Activity summaries

3. **Backup Strategy**
   - Regular backups
   - Data retention policies
   - Recovery procedures