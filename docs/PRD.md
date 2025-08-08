# Interosight MVP - Product Requirements Document

## Problem Statement

Individuals with eating disorders often struggle with fragmented, inconsistent recovery journeys due to:
- Lack of structured, longitudinal self-reflection tools that adapt to their unique recovery trajectory
- Difficulty tracking behavioral patterns and triggers over time in a way that reveals meaningful insights
- Absence of data-driven insights to inform recovery decisions between therapy sessions
- Limited access to personalized recovery guidance outside of therapy sessions
- Existing tools often feel clinical, judgmental, or too rigid for the fluid nature of recovery

Current solutions are either too generic, lack meaning-making opportunities, lack data-driven insights, or don't provide the continuous engagement needed for sustained recovery progress. Most apps focus on symptom tracking without addressing the deeper identity and meaning-making work that sustains long-term recovery.

**For Reddit Demo Context:** The eating disorder recovery community on Reddit actively seeks tools that can help them track patterns, reflect meaningfully, and gain insights into their recovery journey. They want something that feels personal, non-judgmental, and actually helpful rather than just another tracking app.

## Objective & Success Metrics

### Primary Objective
Deliver a minimum viable product that provides users with a structured, data-driven journaling and logging platform for eating disorder recovery, enabling continuous self-reflection and pattern recognition.

### Success Metrics

**MVP Development:**
- Functional beta website deployed and accessible
- Core journaling and logging features working end-to-end
- Basic insights generation functional
- User can complete at least one full module

**Demo Success Metrics (Reddit Release):**
- **User Engagement:**
  - 50+ Reddit users try the demo
  - 30% of users complete Module 1 (Introduction)
  - Average session duration: 10+ minutes
  - 70% of users create at least one journal entry

**Data Quality:**
- 80% of users provide meaningful text responses (50+ words)
- 60% of users log at least one meal/behavior entry
- 90% of journaling sessions meet minimum word count requirements

**User Feedback:**
- Positive sentiment in Reddit comments (70%+ positive)
- Users report finding the tool "helpful" or "promising"
- At least 10 users provide detailed feedback on Reddit
- Users express interest in continued development

**Technical Performance:**
- Site loads in under 3 seconds
- No critical bugs reported
- LLM responses generate within 5 seconds
- Firebase costs stay under $50/month for demo period

## User Stories

### Core User Journey
**As a person in eating disorder recovery,**
- I want to reflect on my eating disorder and identity beyond my eating disorder so that I can build a stronger sense of self
- I want to track my meals and behaviors with images and text so that I can identify patterns over time
- I want to receive personalized insights about my recovery journey so that I can make informed decisions
- I want to have structured journaling prompts (and unstructured journaling opportunities) that help me explore my thoughts and feelings so that I can develop deeper self-awareness
- I want to see my progress over time so that I can stay motivated in my recovery
- I want a private and easy to use tool to accomplish this

### Specific User Stories

**Onboarding & Privacy:**
- As a new user, I want to understand how my data will be used and protected so that I can feel safe sharing personal information
- As a user, I want to provide basic demographic information so that the app can personalize my experience
- As a new user, I want a tutorial of the app features so that I can use the platform effectively

**Journaling & Reflection:**
- As a user, I want to answer reflective prompts about my identity so that I can understand who I am beyond my eating disorder
- As a user, I want to explore my recovery journey so that I can understand what brought me here and what has helped/hurt in the past
- As a user, I want to engage in deep, meaningful journaling sessions so that I can gain insights about myself
- As a user, I want to pause and resume journaling sessions so that I can work at my own pace

**Meal & Behavior Logging:**
- As a user, I want to log my meals with photos and text so that I can track my eating patterns
- As a user, I want to record my emotional state before and after meals so that I can identify triggers
- As a user, I want to look back on previous entries so that I can see my progress over time
- As a user, I want to log compensatory behaviors so that I can track my recovery journey honestly

**Insights & Progress:**
- As a user, I want to receive notifications for reflection opportunities (probably via email for now) so that I can maintain consistent engagement
- As a user, I want to see patterns in my data so that I can understand my triggers and progress across different contexts and topics
- As a user, I want recommendations for additional reflection topics so that I can continue growing

**Reddit Community User Stories:**
- As a Reddit user, I want to try this tool without creating an account first so that I can see if it's worth my time
- As a Reddit user, I want to share my experience with the tool on recovery subreddits so that others can benefit
- As a Reddit user, I want to provide feedback directly to the developer so that the tool can improve
- As a Reddit user, I want the tool to feel different from other recovery apps I've tried so that I'm motivated to use it
- As a Reddit user, I want to see immediate value from the tool so that I'm willing to invest time in it

## Scope

### In Scope (MVP)
- **Base Modules (3):** Introduction, Identity, Your Journey
- **Dynamic Modules (3):** Daily Impact, Interpersonal Impact, Emotional Landscape
- **Core Features:**
  - Structured journaling with AI follow-up prompts
  - Freeform journaling with session isolation
  - Meal and behavior logging with pre/post emotional states
  - Comprehensive history view with AI-generated summaries
  - Progress tracking and module completion
  - User authentication and data privacy
  - Responsive web interface

### Out of Scope (Future Versions)
- Mobile app development
- Advanced analytics and machine learning
- Reddit data collection pipeline
- Email notifications
- Social features
- Professional dashboard for clinicians

## Current Implementation Status

### ✅ Completed Features

**Application Foundation:**
- Modern React + TypeScript + Vite stack
- Tailwind CSS with custom design system
- Firebase integration with Firestore
- User authentication system
- Responsive web interface

**Module System:**
- Introduction module with 4 submodules
- Structured journaling prompts with word count requirements
- Progress tracking and completion functionality
- AI-generated follow-up prompts
- Module progression system

**Journaling Features:**
- Freeform journaling with session isolation
- AI-powered conversation threads
- Real-time word counting
- Session-based data integrity
- Clinical, insight-focused AI summaries (40 words max)

**Activity Logging:**
- Comprehensive meal logging with pre/post emotional states
- Behavior logging with environmental context
- Satiety tracking (hunger/satiety levels)
- Emotional state tracking before and after activities
- Location and social context recording

**History System:**
- Complete chronological history view
- AI-generated summaries for all entry types
- Color-coded entry types (freeform, module, meal, behavior)
- Day stratification and time range filtering
- Modal entry viewing with full details and conversation threads

**AI Integration:**
- Google AI (Gemini) integration for contextual prompts
- Clinical, objective summary generation
- Safety protocols and crisis detection
- Efficient processing at entry creation time

### 🔄 In Progress Features

**Advanced Analytics:**
- Pattern recognition algorithms
- Behavioral trend analysis
- Emotional state tracking over time
- Trigger identification and analysis

**Dynamic Module Progression:**
- User trajectory analysis
- Adaptive module assignment
- Personalized content delivery
- Progress-based recommendations

**Data Visualization:**
- Interactive charts and graphs
- Progress tracking visualizations
- Trend analysis displays
- Comparative analytics

### 📋 Planned Features

**Reddit Integration:**
- Data collection pipeline using PRAW
- User behavior analysis
- Community insights generation

**Machine Learning Features:**
- Advanced pattern recognition
- Predictive analytics
- Personalized recommendations

**Mobile App Development:**
- React Native implementation
- iOS/Android deployment
- Offline functionality

## Technical Architecture

### Frontend Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom design system
- **Routing:** React Router DOM
- **State Management:** React Context + local state
- **Icons:** Lucide React

### Backend Stack
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **AI Services:** Google AI (Gemini)
- **Hosting:** Vercel (web)

### Data Models
- **Journal Entries:** Module and freeform entries with conversation threads
- **Activity Logs:** Meal and behavior logs with pre/post emotional states
- **History Aggregation:** Comprehensive history with AI summaries
- **Module System:** Progressive learning with structured content

### Security & Privacy
- **Data Access:** User-specific data isolation
- **Authentication:** Secure Firebase Auth integration
- **Privacy:** No data sharing with third parties
- **Backup:** User data export capabilities

## User Experience Design

### Core Principles
1. **Clinical Focus:** Professional, non-judgmental interface
2. **Progressive Disclosure:** Information revealed as needed
3. **Immediate Feedback:** Real-time validation and responses
4. **Accessibility:** Inclusive design for all users
5. **Privacy First:** User data protection and control

### Key Screens
1. **Authentication:** Sign-in/sign-up with demo mode
2. **Home Dashboard:** Module overview and action cards
3. **Module Journaling:** Structured prompts with AI follow-up
4. **Freeform Journaling:** Unstructured reflection with session isolation
5. **Activity Logging:** Comprehensive meal and behavior tracking
6. **History View:** Chronological organization with AI summaries
7. **Settings:** Profile, preferences, and data management

### Design System
- **Color Palette:** Olive green theme with clinical focus
- **Typography:** Inter font family for readability
- **Layout:** Desktop-first with responsive design
- **Components:** Reusable card and button components
- **Navigation:** Sidebar navigation for professional feel

## Success Metrics & KPIs

### Technical Metrics
- **Performance:** Page load times under 3 seconds
- **Reliability:** 99.9% uptime for core features
- **Data Quality:** 90%+ data integrity across all entry types
- **AI Response Time:** Summary generation under 5 seconds

### User Experience Metrics
- **Engagement:** 70%+ of users create at least one entry
- **Completion:** 50%+ module completion rate
- **Retention:** 30%+ weekly active user retention
- **Satisfaction:** Positive user feedback on core features

### Development Metrics
- **Code Quality:** TypeScript coverage >90%
- **Test Coverage:** Unit tests for all critical functions
- **Documentation:** Complete API and component documentation
- **Deployment:** Automated CI/CD pipeline

## Risk Assessment

### Technical Risks
- **AI Service Reliability:** Mitigated with fallback mechanisms
- **Data Scale Management:** Addressed with optimized queries
- **Performance Degradation:** Handled with efficient caching
- **Security Vulnerabilities:** Minimized with proper authentication

### User Experience Risks
- **Complexity Overload:** Mitigated with progressive disclosure
- **Privacy Concerns:** Addressed with transparent data practices
- **Engagement Drop-off:** Handled with immediate value delivery
- **Accessibility Issues:** Addressed with inclusive design

### Business Risks
- **Reddit Community Reception:** Mitigated with user-centered design
- **Competition:** Addressed with unique value proposition
- **Regulatory Compliance:** Handled with privacy-first approach
- **Scalability Challenges:** Addressed with modern architecture

## Next Steps

### Immediate Priorities (Next 2-4 weeks)
1. **Advanced Analytics Implementation**
   - Pattern recognition algorithms
   - Behavioral trend analysis
   - Personalized insights generation

2. **Dynamic Module System**
   - User trajectory analysis
   - Adaptive content delivery
   - Progress-based recommendations

3. **Data Visualization**
   - Interactive charts and graphs
   - Progress tracking visualizations
   - Comparative analytics

### Medium-term Goals (Next 1-2 months)
1. **Reddit Integration**
   - Data collection pipeline
   - User behavior analysis
   - Community insights

2. **Machine Learning Features**
   - Advanced pattern recognition
   - Predictive analytics
   - Personalized recommendations

3. **Mobile App Development**
   - React Native implementation
   - iOS/Android deployment
   - Offline functionality

## Conclusion

The Interosight MVP has successfully progressed through three major development phases and is now in the advanced features phase. The foundation is solid, with comprehensive backend integration, AI features, and a complete history system. The application provides immediate value to users while maintaining the flexibility to evolve based on user feedback and community needs.

The next phase focuses on advanced analytics and personalized insights to provide maximum value to users in their recovery journey, while preparing for the Reddit community launch and future mobile app development. 