# Activity Tracking Schema

## Overview

The activity tracking system captures user behaviors, emotions, and patterns through structured logging, supporting meal tracking, behavior monitoring, and emotional state analysis.

## Core Types

### Meal Logging

```typescript
interface MealLog {
  id: string;
  userId: string;
  mealType: MealType;
  description: string;
  
  // Pre/Post Measurements
  satietyPre: number;      // 1-10 scale
  satietyPost: number;     // 1-10 scale
  emotionPre: string[];    // From EMOTIONS constant
  emotionPost: string[];   // From EMOTIONS constant
  affectPre: number;       // 1-10 scale
  affectPost: number;      // 1-10 scale
  
  // Context
  socialContext: SocialContext;
  locationContext: LocationContext;
  
  // Metadata
  createdAt: Timestamp;
  isDeleted: boolean;
}

type MealType = 'Breakfast' | 'Morning Snack' | 'Lunch' | 'Afternoon Snack' | 'Dinner' | 'Evening Snack' | 'Late Night';
type SocialContext = 'Alone' | 'With family' | 'With friends' | 'With colleagues' | 'In a room with others' | 'On video call';
type LocationContext = 'Home' | 'Work' | 'School' | 'Restaurant' | 'Cafeteria' | 'Bedroom' | 'Kitchen' | 'Car' | 'Other';
```

### Behavior Tracking

```typescript
interface BehaviorLog {
  id: string;
  userId: string;
  description: string;
  
  // Pre/Post Measurements
  emotionPre: string[];
  emotionPost: string[];
  affectPre: number;       // 1-10 scale
  affectPost: number;      // 1-10 scale
  
  // Metadata
  createdAt: Timestamp;
  isDeleted: boolean;
}
```

### Constants

```typescript
const EMOTIONS = [
  'Anxious', 'Calm', 'Excited', 'Sad', 'Happy',
  'Stressed', 'Relaxed', 'Guilty', 'Frustrated',
  'Content', 'Worried', 'Confident', 'Overwhelmed',
  'Peaceful'
];

const AFFECT_EMOJIS = [
  '😵‍💫', '😫', '😞', '😔', '😐',
  '🙂', '😊', '😋', '🤩', '🥳'
];

const SATIETY_EMOJIS = [
  '😵', '😰', '😨', '😟', '😐',
  '🙂', '😊', '😋', '😍', '🤤'
];
```

### Analysis Types

```typescript
interface Pattern {
  id: string;
  userId: string;
  type: 'emotional' | 'behavioral' | 'temporal';
  description: string;
  confidence: number;      // 0-1 scale
  data: any;              // Pattern-specific data
  createdAt: string;
}

interface Insight {
  id: string;
  userId: string;
  type: 'pattern' | 'recommendation' | 'celebration';
  title: string;
  description: string;
  data: any;
  createdAt: string;
  isRead: boolean;
}
```

## Database Structure

```
users/
└── {userId}/
    ├── meal_logs/
    │   └── {logId}/
    │       ├── mealType
    │       ├── measurements
    │       ├── context
    │       └── metadata
    │
    ├── behavior_logs/
    │   └── {logId}/
    │       ├── description
    │       ├── measurements
    │       └── metadata
    │
    ├── patterns/
    │   └── {patternId}/
    │       ├── type
    │       ├── description
    │       └── data
    │
    └── insights/
        └── {insightId}/
            ├── type
            ├── title
            └── description
```

## Implementation Notes

### 1. Data Collection
- Validate measurements
- Enforce scale ranges
- Maintain timestamps
- Handle offline data

### 2. Data Analysis
- Pattern recognition
- Trend analysis
- Insight generation
- Progress tracking

### 3. Access Patterns
- Recent logs retrieval
- Pattern aggregation
- Insight delivery
- Export capabilities

### 4. Privacy
- Data encryption
- Access control
- Deletion support
- Data portability

## Security Rules

```javascript
match /users/{userId} {
  match /meal_logs/{logId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  
  match /behavior_logs/{logId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  
  match /patterns/{patternId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if false;  // System-generated only
  }
  
  match /insights/{insightId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if false;  // System-generated only
  }
}
``` 