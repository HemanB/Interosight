# InteroSight Data Flow Diagrams

## User Journey Flows

### 1. New User Onboarding Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Landing   │───►│   Demo      │───►│   Sign Up   │───►│   Profile   │
│   Page      │    │   Mode      │    │   / Login   │    │   Setup     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Privacy   │    │   Sample    │    │   Firebase  │    │   Module 1  │
│   Policy    │    │   Content   │    │   Auth      │    │   Start     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Data Flow:**
1. User visits landing page
2. Clicks "Try Demo" → loads sample data
3. Clicks "Sign Up" → Firebase Auth flow
4. Profile setup → Firestore user document creation
5. Redirected to Module 1 (Introduction)

### 2. Module Navigation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Dashboard │───►│   Module    │───►│  Submodule  │───►|  Journal    |
│   (Home)    │    │   List      │    │  Selection  │───►|  Entry      |
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Progress  │    │   Module    │    │   Content   │    │   LLM       │
│   Overview  │    │   Details   │    │   Loading   │    │   Response  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Data Flow:**
1. Dashboard loads user progress from Firestore
2. Module selection → loads module data
3. Submodule selection → loads content and prompts
4. Journal entry → sends to HuggingFace API
5. Response → updates local state and Firestore

### 3. Journaling Session Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Initial   │───►│   User      │───►│   LLM       │───►│   Follow-up │
│   Prompt    │    │   Response  │    │   Processing│    │   Prompt    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐   ┌─────────────┐
│   Prompt    │    │   Local     │    │  HuggingFace│   │   Session   │
│   Display   │    │   State     │    │  API Call   |   |   Loops     |
└─────────────┘    └─────────────┘    └─────────────┘   └─────────────┘
```

**Data Flow:**
1. Initial prompt loaded from module content
2. User types response → stored in local state
3. Response sent to HuggingFace API with context
4. LLM generates follow-up prompt
5. Session continues or user ends session
6. Final data saved to Firestore

### 4. Meal Logging Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Log       │───►│   Form      │───►│   Validation│───►│   Data      │
│   Selection  │    │   Input     │    │   (Zod)     │    │   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Meal vs    │    │   Multiple  │    │   Client    │    │   Firestore │
│   Behavior   │    │   Fields    │    │   Side      │    │   Collection│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Data Flow:**
1. User selects meal or behavior logging
2. Form renders with appropriate fields
3. User fills out form → client-side validation
4. Valid data → stored in Firestore
5. Analytics processing triggered
6. Insights updated if patterns detected

### 5. Insights Generation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───►│   Data      │───►│   Pattern   │───►│   Insight   │
│   Data      │    │   Aggregation│   │   Analysis  │    │   Generation│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Firestore  │    │  Historical │    │  HuggingFace│    |  User       |
│  Collections│    │  Data       │    │   API       │    |  Display    |
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Data Flow:**
1. User requests insights or scheduled generation
2. System aggregates historical data from Firestore
3. Data sent to HuggingFace API for pattern analysis
4. Insights generated and stored in Firestore
5. User notified and insights displayed in dashboard

## API Integration Flows

### HuggingFace API Integration

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   React     │───►│   API       │───►│  HuggingFace│───►│   Response  │
│   Component │    │   Wrapper   │    │   Inference │    │   Processing│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │   Rate      │    │   Model     │    │   UI        │
│   Input     │    │   Limiting  │    │   Selection │    │   Update    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Data Flow:**
1. User input captured in React component
2. API wrapper handles rate limiting and caching
3. Request sent to HuggingFace Inference API
4. Response processed and formatted
5. UI updated with new content

### Firebase Integration

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   React     │───►│   Firebase  │───►│   Firestore │───►│   Data      │
│   App       │    │   SDK       │    │   Database  │    │   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Local     │    │   Real-time │    │   Security  │    │   Offline   │
│   State     │    │   Updates   │    │   Rules     │    │   Sync      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Data Flow:**
1. React app initializes Firebase SDK
2. Real-time listeners set up for data changes
3. Data operations go through Firestore with security rules
4. Offline support with automatic sync when online
5. Local state updated with Firestore changes

## Error Handling Flows

### API Error Handling

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   API       │───►│   Error     │───►│   Fallback  │───►│  User       |
│   Request   │    │   Detection │    │   Response  │    | Notification│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────
│   Network   │    │   Retry     │    │   Cached    │    │  Graceful   │
│   Timeout   │    │   Logic     │    │   Data      │    │  Degradation│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Data Validation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───►│   Client    │───►│   Server    │───►│   Database  │
│   Input     │    │   Validation│    │   Validation│    │   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Form      │    │   Zod       │    │   Firestore │    │   Success   │
│   Fields    │    │   Schema    │    │   Rules     │    │   Response  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Performance Optimization Flows

### Caching Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───►│   Cache     │───►│   API       │───►│   Response  │
│   Request   │    │   Check     │    │   Call      │    │   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Local     │    │   Hit/Miss  │    │  HuggingFace│    |  Cache      |
│   Storage   │    │   Decision  │    │   API       │    │   Update    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Lazy Loading Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Route      │───►│   Component │───►│   Data      │───►│   UI        │
│  Navigation │    │   Loading   │    │   Fetching  │    │   Rendering │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   React     │    │   Suspense  │    │   Firestore │    │   User      │
│   Router    │    │   Boundary  │    │   Query     │    │  Interaction│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

*These diagrams provide a visual representation of the data flows in the InteroSight application.* 