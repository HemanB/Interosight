# Activity Tracking

## Overview

The activity tracking system captures user behaviors, emotions, and patterns through structured logging. This includes meal logging, behavior tracking, and emotional state monitoring, providing valuable insights for the therapeutic journey.

## Core Components

### 1. Meal Logging

```typescript
interface MealLog {
  id: string;
  userId: string;
  mealType: 'Breakfast' | 'Morning Snack' | 'Lunch' | 'Afternoon Snack' | 'Dinner' | 'Evening Snack' | 'Late Night';
  description: string;
  satietyPre: number;      // 1-10 scale
  satietyPost: number;     // 1-10 scale
  emotionPre: string[];    // From predefined emotion set
  emotionPost: string[];   // From predefined emotion set
  affectPre: number;       // 1-10 scale
  affectPost: number;      // 1-10 scale
  socialContext: SocialContext;
  locationContext: LocationContext;
  createdAt: Timestamp;
  isDeleted: boolean;
}

type SocialContext = 'Alone' | 'With family' | 'With friends' | 'With colleagues' | 'In a room with others' | 'On video call';
type LocationContext = 'Home' | 'Work' | 'School' | 'Restaurant' | 'Cafeteria' | 'Bedroom' | 'Kitchen' | 'Car' | 'Other';
```

### 2. Behavior Tracking

```typescript
interface BehaviorLog {
  id: string;
  userId: string;
  description: string;
  emotionPre: string[];
  emotionPost: string[];
  affectPre: number;       // 1-10 scale
  affectPost: number;      // 1-10 scale
  createdAt: Timestamp;
  isDeleted: boolean;
}
```

### 3. Emotion Sets

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

## Data Collection

### 1. Meal Entry
```typescript
export const createMealLog = async (log: MealLog): Promise<string> => {
  const logRef = collection(db, 'users', log.userId, 'meal_logs');
  return addDoc(logRef, {
    ...log,
    createdAt: Timestamp.now(),
    isDeleted: false
  });
};
```

### 2. Behavior Entry
```typescript
export const createBehaviorLog = async (log: BehaviorLog): Promise<string> => {
  const logRef = collection(db, 'users', log.userId, 'behavior_logs');
  return addDoc(logRef, {
    ...log,
    createdAt: Timestamp.now(),
    isDeleted: false
  });
};
```

## Data Analysis

### 1. Pattern Recognition
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
```

### 2. Insight Generation
```typescript
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

## Implementation Guidelines

### 1. Data Entry
- Validate all inputs
- Enforce scale ranges
- Maintain consistent timestamps
- Handle offline data

### 2. Data Access
- Efficient querying
- Date-based filtering
- Pattern analysis
- Export capabilities

### 3. Privacy
- Data encryption
- Access control
- Deletion support
- Data portability

## User Interface

### 1. Entry Forms
- Quick entry options
- Emotion selectors
- Scale visualizations
- Context pickers

### 2. Visualization
- Timeline views
- Pattern highlights
- Trend analysis
- Progress charts

### 3. Insights
- Daily summaries
- Weekly patterns
- Monthly trends
- Custom reports

## Future Enhancements

### 1. Advanced Analytics
- Machine learning integration
- Predictive patterns
- Correlation analysis
- Custom metrics

### 2. Integration Features
- Health app sync
- Calendar integration
- External tracking
- API access

### 3. Reporting
- Custom dashboards
- Progress reports
- Data visualization
- Export options 