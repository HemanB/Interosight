# Retrospective Logging Feature

## Issue
Users needed the ability to log meals and behaviors retrospectively, with options for "less than 30 minutes ago" or custom date/time selection.

## Solution
Added retrospective logging functionality to the DemoLogScreen with the following features:

### UI Components
- **Checkbox**: "Log retrospectively" toggle
- **Radio buttons**: 
  - "Less than 30 minutes ago" (sets timestamp to 15 minutes ago)
  - "Custom date & time" (shows datetime-local input)
- **Datetime input**: For custom time selection (max value set to current time)

### State Management
```typescript
const [isRetrospective, setIsRetrospective] = useState(false);
const [retrospectiveTime, setRetrospectiveTime] = useState('');
const [customDateTime, setCustomDateTime] = useState('');
```

### Timestamp Logic
```typescript
const getEventTimestamp = () => {
  if (!isRetrospective) {
    return new Date();
  }
  
  if (retrospectiveTime === 'recent') {
    // Less than 30 mins ago - set to 15 mins ago
    const now = new Date();
    return new Date(now.getTime() - 15 * 60 * 1000);
  } else if (retrospectiveTime === 'custom' && customDateTime) {
    return new Date(customDateTime);
  }
  
  return new Date();
};
```

### Firebase Integration
Updated `createMealLog` and `createBehaviorLog` functions to accept optional timestamp:

```typescript
export const createMealLog = async (mealLog: Omit<MealLog, 'id' | 'createdAt'> & { timestamp?: Date }) => {
  const { timestamp, ...mealLogData } = mealLog;
  const docRef = await addDoc(mealsRef, {
    ...mealLogData,
    createdAt: timestamp ? timestamp.toISOString() : new Date().toISOString()
  });
};
```

### Form Reset
Added retrospective state reset to `resetForm()` function:
```typescript
setIsRetrospective(false);
setRetrospectiveTime('');
setCustomDateTime('');
```

## Files Modified
- `src/screens/demo-screens/DemoLogScreen.tsx`: Added UI and state management
- `src/services/firebase.ts`: Updated function signatures to accept timestamp

## Usage
1. User checks "Log retrospectively" checkbox
2. Selects either "Less than 30 minutes ago" or "Custom date & time"
3. If custom, selects specific date and time (limited to past)
4. Log entry is saved with the specified timestamp instead of current time 