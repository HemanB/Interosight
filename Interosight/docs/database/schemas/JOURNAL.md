# Journal System Schema

## Overview

The journal system manages both structured module entries and freeform journaling, supporting AI-assisted prompts and maintaining entry history.

## Core Types

### Journal Entries

```typescript
interface JournalEntry {
  id: string;
  content: string;
  type: 'module_journal' | 'freeform' | 'ai_prompt';
  wordCount: number;
  
  // Module-specific fields (optional)
  moduleId?: string;
  submoduleId?: string;
  chainPosition?: number;
  parentEntryId?: string;
  childEntryIds?: string[];
  isAIPrompt?: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEdited: boolean;
  editHistory?: EditRecord[];
  isDeleted: boolean;
  
  // Analysis
  sentiment?: 'positive' | 'negative' | 'neutral';
  trainingDataPreserved?: boolean;
  originalContent?: string;
}

interface EditRecord {
  timestamp: Timestamp;
  previousContent: string;
  newContent: string;
}
```

### AI Integration

```typescript
interface LLMResponse {
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  followUpPrompt?: string;
  insights?: string[];
}

interface DiscardedPrompt {
  discardedPrompt: string;
  originalPrompt: string;
  userResponse: string;
  shuffleCount: number;
  reason: 'shuffle' | 'timeout';
  chainPosition: number;
  parentEntryId: string;
  timestamp: Timestamp;
  promptFeatures: {
    emotionalIntensity: number;    // 0-1 scale
    personalizationLevel: number;   // 0-1 scale
    questionType: string;
  };
}
```

## Database Structure

```
users/
└── {userId}/
    ├── journal_entries/          # Freeform entries
    │   └── {entryId}/
    │       ├── content
    │       ├── type: 'freeform'
    │       ├── createdAt
    │       └── editHistory
    │
    └── modules/                  # Module entries
        └── {moduleId}/
            └── submodules/
                └── {submoduleId}/
                    ├── entries/  # User responses and AI prompts
                    └── discarded/  # Discarded AI prompts
```

## Implementation Notes

### 1. Entry Management
- Atomic write operations
- Edit history tracking
- Soft deletion support
- Content validation

### 2. AI Integration
- Context preservation
- Chain management
- Prompt quality tracking
- Safety boundaries

### 3. Access Patterns
- Recent entries retrieval
- Chain-based navigation
- Edit history access
- Search functionality

### 4. Data Analysis
- Sentiment tracking
- Pattern recognition
- Progress monitoring
- Insight generation

## Security Rules

```javascript
match /users/{userId} {
  match /journal_entries/{entryId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  
  match /modules/{moduleId}/submodules/{submoduleId} {
    match /entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /discarded/{promptId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Data Validation

```typescript
const validateJournalEntry = (content: string): string[] => {
  const errors: string[] = [];
  
  if (!content.trim()) {
    errors.push('Entry cannot be empty');
  }
  
  if (content.length > 50000) {
    errors.push('Entry is too long (maximum 50,000 characters)');
  }
  
  return errors;
};
``` 