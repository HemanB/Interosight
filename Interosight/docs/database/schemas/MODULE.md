# Module System Schema

## Overview

The module system uses a structured schema design to support progressive learning, track user progress, and manage content delivery.

## Core Types

### Module Definition

```typescript
interface Module {
  id: string;              // Unique identifier (e.g., 'introduction')
  title: string;           // Display title
  description: string;     // Brief description
  order: number;           // Display and progression order
  isLocked?: boolean;      // Whether module requires unlocking
  submodules: Submodule[];
}

interface Submodule {
  id: string;              // Unique identifier (e.g., 'intro-1')
  title: string;           // Display title
  prompt: string;          // Initial journaling prompt
  wordCountRequirement?: {
    minimum: number;
    maximum?: number;
  };
  order: number;           // Display and completion order
}
```

### Progress Tracking

```typescript
interface ModuleProgress {
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
```

### Entry Chain

```typescript
interface JournalEntry {
  id: string;
  content: string;
  type: 'module_journal' | 'ai_prompt';
  moduleId: string;
  submoduleId: string;
  chainPosition: number;
  parentEntryId?: string;
  childEntryIds?: string[];
  isAIPrompt: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEdited: boolean;
  editHistory?: EditRecord[];
  isDeleted: boolean;
}

interface EditRecord {
  timestamp: Timestamp;
  previousContent: string;
  newContent: string;
}
```

## Database Structure

```
users/
└── {userId}/
    ├── module_progress/           # Progress tracking
    │   └── {moduleId}/
    │       ├── submodules        # Map of submodule progress
    │       ├── lastAccessed
    │       ├── unlockedAt
    │       └── completedAt
    │
    └── modules/                   # Module content
        └── {moduleId}/
            └── submodules/
                └── {submoduleId}/
                    └── entries/   # Chain of prompts and responses
```

## Implementation Notes

### 1. Progress Management
- Store progress separately from content
- Use atomic updates for status changes
- Track completion timestamps
- Maintain chain position

### 2. Content Organization
- Hierarchical module structure
- Sequential submodule progression
- Flexible entry chaining
- Edit history preservation

### 3. Access Patterns
- Direct path access for efficiency
- Batch progress updates
- Chain-based entry retrieval
- Progress aggregation

### 4. Data Integrity
- Required field validation
- Status transition checks
- Chain consistency
- Edit tracking

## Security Rules

```javascript
match /users/{userId} {
  match /module_progress/{moduleId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  
  match /modules/{moduleId} {
    match /submodules/{submoduleId} {
      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
``` 