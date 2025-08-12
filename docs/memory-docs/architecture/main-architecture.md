# InteroSight MVP - Main Architecture

## System Overview

InteroSight is a web-based application designed to support eating disorder recovery through structured journaling, behavioral tracking, and AI-powered insights. The system follows a modern web architecture with client-side rendering, serverless backend services, and AI integration.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   Firebase      │    │   AI Services   │
│   (React App)   │◄──►│   (Backend)     │◄──►│   (HuggingFace) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Data     │    │   Analytics &   │    │   Insights &    │
│   (Local State) │    │   Storage       │    │  Recommendations│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## User Data Flow

### 1. Authentication Flow
```
User → React App → Firebase Auth → Firestore (User Profile)
```

**Components:**
- User registers/logs in via Firebase Authentication
- User profile created/retrieved from Firestore
- Session management handled by Firebase Auth
- Demo mode bypasses authentication for trial users

### 2. Module Navigation Flow
```
User → Module Selection → Progress Check → Content Loading → UI Rendering
```

**Components:**
- Module data stored in Firestore
- Progress tracking in user-specific collections
- Dynamic content loading based on user progress
- Real-time progress updates

### 3. Journaling Flow
```
User Input → Local State → LLM Processing → Response Generation → UI Update
```

**Components:**
- User types journal entry in React component
- Text sent to HuggingFace API for reprompting
- LLM response integrated back into UI
- Session state managed locally with Firebase sync

### 4. Logging Flow
```
User Input → Form Validation → Data Storage → Analytics Processing → Insights Generation
```

**Components:**
- Meal/behavior data entered via forms
- Client-side validation with Zod
- Data stored in Firestore collections
- Analytics processed for pattern recognition
- Insights generated and stored

### 5. Insights Flow
```
User Data → Pattern Analysis → Insight Generation → Notification → User Display
```

**Components:**
- Historical data aggregated from Firestore
- Pattern recognition via HuggingFace API
- Insights stored in user-specific collections
- Notifications sent via email service
- Insights displayed in dashboard

## Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **State Management:** React Context + local state
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Custom components with accessibility focus
- **Build Tool:** Vite
- **Package Manager:** npm/yarn

### Backend (Firebase)
- **Authentication:** Firebase Auth
- **Database:** Firestore (NoSQL)
- **Storage:** Firebase Storage (for future image uploads)
- **Functions:** Firebase Functions (serverless)
- **Hosting:** Firebase Hosting or Vercel/Netlify
- **Analytics:** Firebase Analytics

### AI/ML Services
- **LLM API:** HuggingFace Inference API
- **Text Processing:** HuggingFace Transformers
- **Model Selection:** Cost-effective models (e.g., GPT-2, BERT variants)
- **Rate Limiting:** Client-side and server-side
- **Caching:** Firebase Cache or Redis

### External Services
- **Email:** SendGrid or Firebase Functions with SMTP
- **Error Tracking:** Sentry or Firebase Crashlytics
- **Monitoring:** Firebase Performance Monitoring

## Data Architecture

### Firestore Collections

#### Users
```typescript
users/{userId}
├── profile: UserProfile
├── settings: UserSettings
├── createdAt: string
└── lastActive: string
```

#### Module Progress
```typescript
userProgress/{userId}/modules/{moduleId}
├── completed: boolean
├── submodules: SubmoduleProgress[]
├── startedAt: string
└── completedAt?: string
```

#### Journal Entries
```typescript
journalEntries/{userId}
├── entries: JournalEntry[]
└── sessions: JournalSession[]
```

#### Log Entries
```typescript
logEntries/{userId}
├── meals: MealEntry[]
└── behaviors: BehaviorEntry[]
```

#### Insights
```typescript
insights/{userId}
├── patterns: Pattern[]
├── recommendations: Recommendation[]
└── notifications: Notification[]
```

### Data Models

#### User Profile
```typescript
interface UserProfile {
  email: string;
  displayName?: string;
  age?: number;
  recoveryStage?: string;
  privacySettings: PrivacySettings;
  preferences: UserPreferences;
}
```

#### Journal Entry
```typescript
interface JournalEntry {
  id: string;
  moduleId: string;
  submoduleId: string;
  prompt: string;
  response: string;
  timestamp: string;
  wordCount: number;
  sessionId: string;
  metadata: JournalMetadata;
}
```

#### Meal Entry
```typescript
interface MealEntry {
  id: string;
  mealType: string;
  description: string;
  reflection: string;
  satietyPre: number;
  satietyPost: number;
  emotionsPre: string[];
  emotionsPost: string[];
  feelingPre: number;
  feelingPost: number;
  socialContext: string;
  location: string;
  timestamp: string;
}
```

#### Behavior Entry
```typescript
interface BehaviorEntry {
  id: string;
  trigger: string;
  behavior: string;
  reflection: string;
  emotionsPre: string[];
  emotionsPost: string[];
  feelingPre: number;
  feelingPost: number;
  socialContext: string;
  location: string;
  timestamp: string;
}
```

## Security Architecture

### Authentication & Authorization
- Firebase Authentication for user management
- JWT tokens for session management
- Role-based access control (user, admin)
- Demo mode with limited functionality

### Data Security
- Firestore Security Rules for data access control
- Encrypted data transmission (HTTPS)
- User data isolation by userId
- Privacy settings for data sharing

### API Security
- Rate limiting on HuggingFace API calls
- Input validation and sanitization
- CORS configuration for web app
- Error handling without sensitive data exposure

## Performance Considerations

### Frontend Performance
- Code splitting and lazy loading
- React.memo for component optimization
- Efficient state management
- Image optimization and compression
- Service worker for caching

### Backend Performance
- Firestore query optimization
- Indexing strategy for common queries
- Pagination for large datasets
- Caching for frequently accessed data
- CDN for static assets

### AI/ML Performance
- Model selection for cost/performance balance
- Request batching where possible
- Fallback responses for API failures
- Caching for common LLM responses

## Scalability Strategy

### Horizontal Scaling
- Serverless architecture (Firebase Functions)
- Auto-scaling based on demand
- CDN for global content delivery
- Database read replicas if needed

### Data Scaling
- Efficient data modeling for Firestore
- Pagination and lazy loading
- Data archiving strategy
- Analytics data aggregation

### Cost Optimization
- HuggingFace API usage monitoring
- Firebase usage optimization
- Caching to reduce API calls
- Efficient data storage patterns

## Monitoring & Observability

### Application Monitoring
- Firebase Performance Monitoring
- Error tracking with Sentry
- User analytics with Firebase Analytics
- Custom event tracking

### Infrastructure Monitoring
- Firebase Console monitoring
- API usage and cost tracking
- Database performance metrics
- Error rate monitoring

### User Experience Monitoring
- Page load times
- User interaction tracking
- Feature usage analytics
- User feedback collection

## Deployment Architecture

### Development Environment
- Local development with Firebase emulators
- Hot reloading with Vite
- TypeScript compilation
- ESLint and Prettier for code quality

### Staging Environment
- Firebase project for testing
- Separate HuggingFace API keys
- Mock data for testing
- User acceptance testing

### Production Environment
- Firebase production project
- CDN for global distribution
- SSL certificates
- Monitoring and alerting

## Disaster Recovery

### Data Backup
- Firestore automatic backups
- Manual backup procedures
- Data export capabilities
- Recovery testing procedures

### Service Continuity
- Multiple Firebase regions
- API fallback strategies
- Graceful degradation
- User notification systems

## Compliance & Privacy

### Data Privacy
- GDPR compliance measures
- Data minimization principles
- User consent management
- Data deletion capabilities

### Healthcare Compliance
- HIPAA considerations
- Data encryption standards
- Access control measures
- Audit trail requirements

---

*This architecture document will be updated as the system evolves and new requirements emerge.* 