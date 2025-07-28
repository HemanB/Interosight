# InteroSight Features

## Core Features

### 1. User Management
**Status:** Planned
**Priority:** High
**Description:** Complete user authentication and profile management system

**Components:**
- [ ] User registration and login
- [ ] Profile creation and management
- [ ] Privacy settings and data consent
- [ ] Account deletion and data export
- [ ] Demo mode (guest access)

**Technical Requirements:**
- Firebase Authentication
- User profile data in Firestore
- Privacy policy integration
- GDPR compliance features

### 2. Module System
**Status:** Planned
**Priority:** High
**Description:** Structured content delivery system with progress tracking

**Components:**
- [ ] Module navigation and progress visualization
- [ ] Submodule completion tracking
- [ ] Dynamic module assignment
- [ ] Progress persistence and sync
- [ ] Module content management

**Technical Requirements:**
- Module data structure in Firestore
- Progress tracking system
- Dynamic content loading
- Offline progress caching

### 3. Journaling System
**Status:** Planned
**Priority:** High
**Description:** LLM-powered reflective journaling with adaptive prompts

**Components:**
- [ ] Initial prompt generation
- [ ] LLM-powered reprompting
- [ ] Session management (pause/resume)
- [ ] Word count tracking
- [ ] Entry history and editing
- [ ] Semantic richness scoring

**Technical Requirements:**
- HuggingFace API integration
- Prompt engineering system
- Session state management
- Text processing and analysis

### 4. Meal Logging
**Status:** Planned
**Priority:** High
**Description:** Comprehensive meal tracking with emotional and contextual data

**Components:**
- [ ] Meal type and description input
- [ ] Pre/post satiety sliders
- [ ] Emotional state checkboxes
- [ ] General feeling sliders
- [ ] Social context selection
- [ ] Location information
- [ ] Reflection text input

**Technical Requirements:**
- Form validation with Zod
- Slider and checkbox components
- Data persistence in Firestore
- Input validation and sanitization

### 5. Behavior Logging
**Status:** Planned
**Priority:** High
**Description:** Tracking of behaviors and associated triggers

**Components:**
- [ ] Trigger identification input
- [ ] Behavior description
- [ ] Pre/post emotional states
- [ ] General feeling tracking
- [ ] Social and location context
- [ ] Reflection and insights

**Technical Requirements:**
- Similar to meal logging
- Trigger categorization system
- Pattern recognition preparation

### 6. Data Visualization
**Status:** Planned
**Priority:** Medium
**Description:** Basic analytics and pattern visualization

**Components:**
- [ ] Meal timing consistency graphs
- [ ] Emotional state trends
- [ ] Journaling engagement metrics
- [ ] Progress over time charts
- [ ] Pattern identification displays

**Technical Requirements:**
- Chart.js or D3.js integration
- Data aggregation functions
- Real-time chart updates
- Responsive chart design

### 7. Insights Generation
**Status:** Planned
**Priority:** Medium
**Description:** AI-powered insights and recommendations

**Components:**
- [ ] Basic pattern recognition
- [ ] Personalized recommendations
- [ ] Recovery milestone tracking
- [ ] Therapy session preparation prompts
- [ ] Encouragement and celebration messages

**Technical Requirements:**
- HuggingFace API for analysis
- Recommendation algorithm
- Notification system
- Insight storage and retrieval

### 8. Notification System
**Status:** Planned
**Priority:** Low
**Description:** Email-based engagement and reflection reminders

**Components:**
- [ ] Email notification setup
- [ ] Reflection reminder scheduling
- [ ] Therapy session preparation
- [ ] Encouragement messages
- [ ] Notification preferences

**Technical Requirements:**
- Email service integration
- Scheduling system
- Template management
- User preference handling

## Demo-Specific Features

### 9. Guest Mode
**Status:** Planned
**Priority:** High
**Description:** Allow users to try the app without registration

**Components:**
- [ ] Demo data population
- [ ] Sample insights generation
- [ ] Feature limitation handling
- [ ] Easy transition to full account
- [ ] Clear demo vs real data distinction

### 10. Feedback Collection
**Status:** Planned
**Priority:** Medium
**Description:** System for collecting user feedback and suggestions

**Components:**
- [ ] In-app feedback form
- [ ] Feature request system
- [ ] Bug reporting
- [ ] User satisfaction surveys
- [ ] Feedback analytics

## Future Features (Post-MVP)

### 11. Image Upload
**Status:** Future
**Priority:** Low
**Description:** Photo upload for meal tracking

### 12. Advanced Analytics
**Status:** Future
**Priority:** Low
**Description:** Deep pattern analysis and predictive insights

### 13. Healthcare Provider Integration
**Status:** Future
**Priority:** Low
**Description:** Secure data sharing with healthcare teams

### 14. Mobile App
**Status:** Future
**Priority:** Low
**Description:** Native mobile application

### 15. Social Features
**Status:** Future
**Priority:** Low
**Description:** Peer support and community features

## Feature Status Legend
- **Implemented:** Feature is complete and functional
- **In Progress:** Feature is currently being developed
- **Planned:** Feature is planned for MVP
- **Future:** Feature planned for post-MVP versions
- **Cancelled:** Feature has been removed from scope

## Feature Dependencies
- Module System → Journaling System
- User Management → All other features
- Data Logging → Insights Generation
- LLM Integration → Journaling System, Insights Generation

---

*Last Updated: [Date]*
