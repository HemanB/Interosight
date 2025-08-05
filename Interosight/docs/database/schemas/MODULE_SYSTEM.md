# Module System

## Overview

The module system is designed to provide a structured, progressive learning experience through guided journaling. Each module focuses on a specific aspect of self-discovery and healing, with submodules that break down the learning into manageable steps.

## Module Structure

```typescript
interface Module {
  id: string;              // Unique identifier (e.g., 'introduction', 'identity')
  title: string;           // Display title
  description: string;     // Brief description of module purpose
  order: number;           // Display and progression order
  isLocked?: boolean;      // Whether module requires unlocking
  submodules: Submodule[];
}

interface Submodule {
  id: string;              // Unique identifier (e.g., 'intro-1')
  title: string;           // Display title
  prompt: string;          // Initial journaling prompt
  wordCountRequirement?: { // Optional word count constraints
    minimum: number;
    maximum?: number;
  };
  order: number;           // Display and completion order
}
```

## Core Modules

1. **Introduction** (id: 'introduction')
   - Welcome and expectations
   - Personal story and goals

2. **Identity & Self** (id: 'identity')
   - Core values exploration
   - Authentic self-discovery

3. **Journey** (id: 'journey')
   - Past reflections
   - Future vision

4. **Daily Impact** (id: 'daily-impact')
   - Daily patterns
   - Coping strategies

5. **Relationships** (id: 'relationships')
   - Support systems
   - Communication patterns

6. **Emotional Awareness** (id: 'emotions')
   - Emotional patterns
   - Growth and development

## Progress Tracking

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

## Entry Chain System

```typescript
interface JournalEntry {
  id: string;
  content: string;
  type: 'module_journal' | 'freeform' | 'ai_prompt';
  moduleId?: string;
  submoduleId?: string;
  chainPosition?: number;
  parentEntryId?: string;
  childEntryIds?: string[];
  isAIPrompt: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEdited: boolean;
  editHistory?: EditRecord[];
  isDeleted: boolean;
}
```

## Module Progression

1. **Initial State**
   - Only Introduction module unlocked
   - All other modules locked
   - No progress data exists

2. **Module Completion**
   - All submodules must be completed
   - Minimum word count requirements met
   - Follow-up prompts addressed

3. **Module Unlocking**
   - Automatic on previous module completion
   - Maintains sequential progression
   - Preserves therapeutic journey

## Implementation Guidelines

1. **Content Creation**
   - Clear, focused prompts
   - Progressive difficulty
   - Therapeutic value prioritized

2. **User Experience**
   - Clear progress indicators
   - Flexible navigation
   - Save and resume capability

3. **Data Management**
   - Atomic updates
   - Progress preservation
   - Entry chain integrity

4. **Security**
   - User data isolation
   - Progress verification
   - Edit history tracking

## Future Enhancements

1. **Dynamic Modules**
   - Personalized content
   - Adaptive difficulty
   - Custom paths

2. **Progress Analysis**
   - Engagement metrics
   - Completion patterns
   - Therapeutic outcomes

3. **Content Expansion**
   - Additional modules
   - Specialized topics
   - Community content 