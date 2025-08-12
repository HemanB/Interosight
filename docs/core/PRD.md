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
- As a Reddit user, I want to share my experience with the tool on recovery subreddits so that others can benefit
- As a Reddit user, I want to provide feedback directly to the developer so that the tool can improve
- As a Reddit user, I want the tool to feel different from other recovery apps I've tried so that I'm motivated to use it
- As a Reddit user, I want to see immediate value from the tool so that I'm willing to invest time in it

## Scope

### In Scope (MVP)
- **Base Modules (3):** Introduction, Identity, Your Journey
- **Dynamic Modules (3):** Daily Impact, Interpersonal Impact, Emotional Landscape
- **Core Features:**
  - User onboarding and privacy management
  - Structured journaling with LLM-powered reprompting
  - Meal/behavior logging (text-based only for demo)
  - Progress tracking and visualization
  - Basic insight generation and notifications
  - Firebase/Firestore database integration
  - Beta web app with demo mode
  - Guest user experience (no account required for initial trial)

**Demo-Specific Features:**
- Guest mode allowing users to try core features without registration
- Sample data to demonstrate insights and patterns
- Quick tutorial/walkthrough for new users
- Feedback collection mechanism
- Reddit-friendly sharing capabilities

### Out of Scope (Future Versions)
- **Advanced Features:**
  - Photo upload for meal tracking on mobile app
  - Integration with healthcare provider system
  - Advanced ML models for predictive insights
  - Integration with wearable devices
  - Advanced analytics dashboard for healthcare providers
  - Multi-language support
  - Offline-first functionality

## Functional Requirements

### 1. User Management
- User registration and authentication via Firebase Auth
- Profile creation with demographic data collection
- Privacy policy acceptance and data consent management
- Account settings and data export capabilities
- **Demo Mode:**
  - Guest access without registration
  - Sample user profile for demonstration
  - Clear distinction between demo and real user data
  - Easy transition from demo to full account creation

### 2. Module System
- **Module Structure:**
  - 3 base modules with 4-6 submodules each
  - 3 dynamic modules assigned based on user progress
  - Each submodule contains journaling prompts and input fields
- **Progress Tracking:**
  - Visual progress indicators for modules and submodules
  - Completion status persistence
  - Ability to revisit and edit previous entries

### 3. Journaling System
- **LLM-Powered Reprompting:**
  - Initial prompts for each submodule are LLM generated but designed with a strong system prompt.
  - Dynamic follow-up prompts based on user responses
  - Word count fulfillment for completion
  - Ability to revisit previous sessions and update or continue journal entries
- **Input Types:**
  - Rich text input with auto-expanding fields
  - Timestamp and metadata capture

### 4. Logging System
- **Meal Logging:**
  - Text input (prompt mealtype, meal desc., and reflection)
  - Satiety pre/post (Quantified on slider)
  - Emotions pre/post (Check all that apply)
  - General Feeling pre/post (Quantified on slider)
  - Social Information (Basic: alone, in a room with others, with others)
  - Location Information (Basic: Home, Work, School, Cafeteria, Bedroom, etc)
- **Behavior Logging:**
  - Text input (prompt trigger, behavior, and reflection)
  - Emotions pre/post (Check all that apply)
  - General Feeling pre/post (Quantified on slider)
  - Social Information (Basic: alone, in a room with others, with others)
  - Location Information (Basic: Home, Work, School, Cafeteria, Bedroom, etc)
- **History & Review:**
  - Chronological view of all entries each organized as a distinct card with all cards layered and scrollable
  - Search and filter capabilities
  - Data export functionality

### 5. Data Management
- **Raw Data Storage:**
  - Firebase Firestore for user data
  - Image storage in Firebase Storage
  - Secure, encrypted data transmission

### 6. Insight Generation (In-Progress)
- **Basic Analytics:**
  - Display basic graph of meal timing consistency
  - Emotional state information
  - Journaling engagement metrics
    - Time spent
    - Word count
    - Major topics identified
- **Notifications:**
  - Reflection reminders based on user patterns
  - Therapy session preparation prompts
  - Encouragement and Celebration
- **Recommendations:**
  - Dynamic module suggestions
  - Additional journaling prompts
  - Recovery resource recommendations
- **Demo Insights:**
  - Sample data visualization to show potential insights
  - Mock patterns and trends for demonstration
  - Clear indication of what insights would look like with real data

## UI Guidelines

### Design Principles
- **Compassionate & Non-Judgmental:** Warm, supportive visual language
- **Accessible:** WCAG 2.1 AA compliance, high contrast options
- **Minimalist:** Clean, distraction-free interface focused on content

### Visual Design
- **Color Palette:**
  - Primary: monochromatic black-white scale with subtle grays
  - Accent: Olive for interactive elements and progress indicators
  - Modern but not industrial feel - warm and approachable
  - High contrast for accessibility

- **Typography:**
  - Sans-serif fonts for readability (Inter or system fonts)
  - Large, clear text for prompts and instructions (18px+ for body text)
  - Adequate line spacing (1.6+ line-height) for comfortable reading
  - Clear hierarchy with different font weights and sizes

- **Imagery:**
  - None for now
  - Subtle geometric patterns or shapes for visual interest
  - Clean, minimal icons for navigation and actions

### Interaction Design
- **Journey Visualization:**
  - Horizontal path showing module progression
  - Clear visual indicators for completed, current, and future modules
  - Smooth animations for progress updates
- **Journaling Interface:**
  - Large, prominent prompt display
  - Auto-expanding text input areas
  - Clear action buttons with descriptive labels
  - Progress indicators that fill based on engagement
- **Navigation:**
  - Intuitive back/forward navigation
  - Breadcrumb trails for complex flows
  - Easy access to saved progress and history

### Accessibility Features
- Screen reader compatibility
- Keyboard navigation support
- High contrast mode
- Adjustable text sizing
- Reduced motion options
- Clear focus indicators

## Technical Stack Notes

### Frontend
- **Framework:** React with TypeScript
- **State Management:** React Context + local state
- **Styling:** Tailwind CSS or styled-components
- **UI Components:** Custom components with accessibility focus
- **Image Handling:** React Dropzone for uploads, image compression

### Backend
- **Database:** Firebase Firestore (primary), Firebase Storage (images)
- **Authentication:** Firebase Auth
- **API:** Firebase Functions for serverless backend logic

### AI/ML Components
- **Text Processing:** HuggingFace API
- **LLM Integration:** HuggingFace API (using smaller, cost-effective models for demo)
- **Analysis:** Python backend for data processing and insight generation
- **Demo Considerations:**
  - Rate limiting to control API costs
  - Caching for common responses
  - Fallback responses if API is unavailable
  - Mock responses for demo mode to reduce costs

### Infrastructure
- **Hosting:** Vercel or Netlify for frontend
- **CI/CD:** GitHub Actions
- **Monitoring:** Firebase Analytics, error tracking
- **Security:** Firebase Security Rules, data encryption

## Dependencies

### External Dependencies
- **Firebase Services:** Firestore, Auth, Storage, Functions
- **AI/ML APIs:** HuggingFace API
- **Image Processing:** Client-side compression libraries
- **Analytics:** Firebase Analytics, error tracking service

### Internal Dependencies
- **Module Content:** Curated prompts and content for all modules, specific system prompts for each module and submodule.
- **Privacy Framework:** Data handling and consent management system

### Development Dependencies
- **Frontend:** React, TypeScript, testing framework
- **Backend:** Node.js, Python (for ML components)
- **Database:** Firebase CLI, local development tools
- **Design:** Figma or similar for UI/UX design

## Open Questions & Risks

### Technical Risks
1. **LLM API Costs:** High usage of HuggingFace API can be expensive
   - *Mitigation:* Implement usage limits (rate limiting, input token limits per message)
2. **Image Storage Costs:** Large image files could increase storage costs
   - *Mitigation:* Client-side compression, storage limits, input limits

### Product Risks
1. **User Engagement:** Users may not engage deeply enough for meaningful insights
   - *Mitigation:* Gamification, progress visualization, gentle reminders
2. **Data Quality:** Users may provide insufficient or inaccurate data
   - *Mitigation:* Clear instructions, validation, example entries
3. **Privacy Concerns:** Users may be hesitant to share sensitive information
   - *Mitigation:* Transparent privacy policy, data control features

### Open Questions
1. **LLM Prompt Engineering:** What prompts generate the most meaningful reprompts?
2. **Semantic Richness Threshold:** What constitutes "sufficient" engagement for completion?
3. **Dynamic Module Assignment:** What criteria determine when to assign dynamic modules?
4. **Insight Frequency:** How often should insights be generated and delivered?
5. **Data Retention:** How long should user data be retained for analysis?

**Demo-Specific Questions:**
6. **Reddit Community Response:** How will the eating disorder recovery subreddits receive this tool?
7. **Demo vs Full Experience:** What features are most important to showcase in the demo?
8. **Feedback Collection:** What's the best way to collect meaningful feedback from Reddit users?
9. **Cost Management:** How can we keep API costs low while providing a compelling demo experience?
10. **Technical Support:** How will we handle technical issues during the Reddit demo period?

### Regulatory Considerations
- **HIPAA Compliance:** Ensure data handling meets healthcare privacy standards
- **GDPR Compliance:** Implement data portability and deletion features
- **COPPA Compliance:** Age verification and parental consent for minors
- **DHAF/ORCHA Compliance:** Fulfill the criteria set forth by the digital health assessment framework

## Demo Launch Strategy

### Reddit Community Targeting
- **Primary Subreddits:**
  - r/EatingDisorders
  - r/fuckeatingdisorders
  - r/EDAnonymous
  - r/AnorexiaNervosa
  - r/bulimia
- **Secondary Subreddits:**
  - r/mentalhealth
  - r/therapy
  - r/selfhelp

### Launch Approach
- **Soft Launch:** Share with 2-3 smaller subreddits first to gather initial feedback
- **Main Launch:** Post to larger recovery subreddits with refined messaging
- **Follow-up:** Engage with comments and feedback post-launch

### Messaging Strategy
- **Tone:** Humble, community-focused, seeking feedback
- **Key Points:**
  - Built by someone in recovery for the recovery community
  - Free demo available, no pressure to sign up
  - Seeking honest feedback to improve the tool
  - Emphasize privacy and user control
- **Call to Action:** Try the demo and share your thoughts

### Success Indicators
- Positive engagement in Reddit comments
- Users trying the demo and providing feedback
- Community members sharing the tool with others
- Constructive criticism that can inform development

---

*This PRD is a living document that will be updated as the project evolves and new requirements emerge.* 