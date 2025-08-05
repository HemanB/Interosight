# Module Data Schemas

## Overview

This document defines the data schemas for the module system, including module structure, progress tracking, and entry organization.

## Core Structure

```typescript
users/
└── {userId}/
    └── modules/
        └── {moduleId}/              # e.g., "introduction"
            ├── progress             # Module progress document
            └── submodules/
                └── {submoduleId}/   # e.g., "intro_1"
                    ├── prompt       # Initial module prompt
                    ├── response     # User's response
                    ├── reprompt     # Follow-up prompt (if any)
                    └── final_response # Response to reprompt (if any)
```

## Document Schemas

### Module Progress Document
```typescript
interface ModuleProgress {
  submodules: {
    [submoduleId: string]: {
      status: 'not_started' | 'in_progress' | 'completed';
      completedAt?: Timestamp;
    };
  };
  lastAccessed: Timestamp;
  unlockedAt: Timestamp;
  completedAt?: Timestamp;
}
```

### Module Entry Document
```typescript
interface ModuleEntry {
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Module Types

### Base Modules
1. **Introduction Module**
   - Setting the stage for recovery
   - Privacy and data collection
   - App feature tutorial
   - Initial reflective journaling

2. **Identity Module**
   - Identity beyond eating disorder
   - Values and authentic self
   - Role exploration
   - Self-discovery journaling

3. **Journey Module**
   - Recovery journey reflection
   - Past experiences
   - Current motivations
   - Future aspirations

### Dynamic Modules
1. **Daily Impact Module**
   - Daily life effects
   - Behavioral patterns
   - Routine disruptions
   - Recovery goals

2. **Interpersonal Impact Module**
   - Relationship effects
   - Social patterns
   - Support systems
   - Communication challenges

3. **Emotional Landscape Module**
   - Emotional awareness
   - Coping strategies
   - Trigger identification
   - Emotional regulation

## Implementation Notes

### Data Access Patterns
- Direct path access to any entry
- Progress tracking separate from content
- Simple timestamp-based ordering
- No analytics metadata in core structure

### Security Considerations
- Path-based security rules
- User data isolation
- Write-once entries
- Controlled progression

---

*This document defines the core data structures for the module system. All module-related data should follow these schemas.* 