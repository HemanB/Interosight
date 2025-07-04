# InteroSight MVP Roadmap

## Overview

This roadmap outlines the development of a highly-functional MVP for InteroSight, focusing on design strength and core functionality. We'll use free Firebase/Firestore and Expo development tools to create a compelling prototype for clinicians and funding sources.

## Development Environment

### Simple Setup
```bash
# Activate preexisting conda environment
conda activate interosight

# Initialize project
npx create-expo-app@latest InteroSight --template blank-typescript
cd InteroSight

# Install only essential dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens
npm install @expo/vector-icons
npm install firebase
npm install expo-secure-store
npm install expo-haptics
npm install expo-linear-gradient
npm install react-native-reanimated
npm install react-native-gesture-handler
```

## MVP Architecture (Well-Siloed & Easy Integration)

### Project Structure
```
InteroSight/
├── src/
│   ├── core/                    # Core application logic
│   │   ├── interfaces/          # Service contracts
│   │   │   ├── auth.interface.ts
│   │   │   ├── chat.interface.ts
│   │   │   ├── meals.interface.ts
│   │   │   └── behaviors.interface.ts
│   │   ├── types/              # TypeScript type definitions
│   │   │   ├── auth.types.ts
│   │   │   ├── chat.types.ts
│   │   │   ├── meals.types.ts
│   │   │   ├── behaviors.types.ts
│   │   │   └── common.types.ts
│   │   ├── constants/          # App-wide constants
│   │   │   ├── colors.ts
│   │   │   ├── fonts.ts
│   │   │   ├── spacing.ts
│   │   │   └── crisis.ts
│   │   └── utils/              # Utility functions
│   │       ├── validation.ts
│   │       ├── formatting.ts
│   │       └── helpers.ts
│   ├── services/               # Business logic services
│   │   ├── auth/               # Authentication service
│   │   │   ├── auth.service.ts
│   │   │   └── auth.mock.ts
│   │   ├── chat/               # LLM chat service
│   │   │   ├── chat.service.ts
│   │   │   ├── llm.service.ts
│   │   │   └── crisis.service.ts
│   │   ├── meals/              # Meal logging service
│   │   │   ├── meals.service.ts
│   │   │   └── meals.mock.ts
│   │   └── behaviors/          # Behavior/trigger logging service
│   │       ├── behaviors.service.ts
│   │       └── behaviors.mock.ts
│   ├── providers/              # React Context providers
│   │   ├── AuthProvider.tsx
│   │   ├── ChatProvider.tsx
│   │   ├── MealsProvider.tsx
│   │   ├── BehaviorsProvider.tsx
│   │   └── AppProvider.tsx
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   ├── forms/              # Form components
│   │   │   ├── MealForm.tsx
│   │   │   ├── BehaviorForm.tsx
│   │   │   └── AuthForm.tsx
│   │   ├── navigation/         # Navigation components
│   │   │   ├── TabBar.tsx
│   │   │   └── Header.tsx
│   │   ├── chat/               # Chat-specific components
│   │   │   ├── TypewriterText.tsx
│   │   │   ├── ChatBubble.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── character/             # Character components
│   │   │   ├── Character.tsx
│   │   │   └── CharacterAnimations.tsx
│   │   └── crisis/             # Crisis support components
│   │       ├── CrisisModal.tsx
│   │       ├── EmergencyContacts.tsx
│   │       └── DBTTools.tsx
│   ├── screens/                # Screen components
│   │   ├── auth/               # Authentication screens
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── home/               # Home dashboard
│   │   │   ├── HomeScreen.tsx
│   │   │   └── components/
│   │   │       ├── StreakCard.tsx
│   │   │       ├── XPCard.tsx
│   │   │       └── TodoList.tsx
│   │   ├── chat/               # Chat interface
│   │   │   ├── ChatScreen.tsx
│   │   │   └── components/
│   │   │       ├── ChatContainer.tsx
│   │   │       └── PromptSelector.tsx
│   │   ├── logging/            # Combined meal & behavior logging
│   │   │   ├── LoggingScreen.tsx
│   │   │   └── components/
│   │   │       ├── MealLogging.tsx
│   │   │       ├── BehaviorLogging.tsx
│   │   │       ├── LogHistory.tsx
│   │   │       └── LogStats.tsx
│   │   ├── crisis/             # Crisis tools
│   │   │   ├── CrisisScreen.tsx
│   │   │   └── components/
│   │   │       ├── CrisisTools.tsx
│   │   │       ├── EmergencyContacts.tsx
│   │   │       └── DBTTools.tsx
│   │   └── settings/           # App settings
│   │       ├── SettingsScreen.tsx
│   │       └── components/
│   │           ├── NotificationSettings.tsx
│   │           ├── PrivacySettings.tsx
│   │           └── HelpResources.tsx
│   ├── navigation/             # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useMeals.ts
│   │   ├── useBehaviors.ts
│   │   └── useCrisis.ts
│   └── assets/                 # Images, fonts, etc.
│       ├── images/
│       ├── fonts/
│       └── icons/
├── firebase/                   # Firebase configuration
│   ├── config.ts
│   └── firestore.rules
├── tests/                      # Test files
│   ├── components/
│   ├── services/
│   └── screens/
└── docs/                       # Documentation
    ├── flowcharts/
    └── api/
```

### Core Features (MVP Only)
1. **Authentication** - Simple email/password with Firebase
2. **Chat Interface** - Chat with LLM integration
3. **Combined Logging** - Meal logging + Behavior/trigger logging in one screen
4. **Crisis Tools** - Emergency resources and crisis detection
5. **Home Dashboard** - Simple overview and navigation

## Detailed Screen Descriptions

### 1. Authentication Screens

#### Login Screen
**Visual Design**: 
- Clean, minimalist design (UI TBD)
- Soft, muted, calming

**Functionality**: 
- Email and password input fields, well integrated into the scene
- Matching font and theme throughout
- Clear validation with real-time feedback
- "Remember me" checkbox for convenience
- "Forgot password?" link that opens a modal
- "Sign up" link for new users
- Loading state with gentle circling animation (baby dragon flying in circles)
- Error messages displayed below inputs with theme-matched styling

**User Experience**: 
- Form validation happens in real-time as user types
- Password field has show/hide toggle
- Keyboard automatically focuses on email field when screen loads
- Smooth transitions between login states

#### Signup Screen
**Visual Design**: 
- Similar to login but with additional fields
- Same animated landscape background

**Functionality**:
- Email, password, and confirm password fields
- Password strength indicator with visual feedback
- Terms of service and privacy policy checkboxes
- Age verification (must be 13+)
- Clear disclaimer about app not replacing professional treatment
- Email verification flow

**User Experience**:
- Password strength meter shows real-time feedback
- Terms checkbox must be checked to proceed
- Clear explanation of what the app does and doesn't do
- Smooth transition to email verification if required

### 2a. Home Dashboard (First-time Login)

**Functionality**:
- **Character Selection**: Ability to select between 3 characters
- **Username input**: Ability to customize username
- **Transition into main home dashboard**: gentle animation into main home dashboard

**User Experience**:
- Character selection should be intuitive
- 3 options to select from, clicking on each character should bring up a small narrative
- Narrative displayed in theme-matched manner
- User should have the option to input custom username
- Should have a confirm button to continue to main home dashboard

### 2b. Home Dashboard

**Visual Design**: 
- RPG-style dashboard with a gentle animation of user-chosen character
- XP bar and streak counter (card) hover above the head of the animated character
- User-selected username displayed prominently (in the same card as xp and streak)
- Game-like styling for XP and streak elements

**Functionality**:
- **Character Animation**: Gently animated user-selected character from initial login
- **Streak Counter**: Shows consecutive days of app usage
- **XP Progress Bar**: Visual representation of user's engagement and progress
- **Daily Goals**: 3-5 simple tasks with XP rewards
- Goals include: "Log a meal/behavior", "Visit the Stone of Wisdom", etc.
- Goals ONLY checked off if user actually does the task in game

**User Experience**:
- Character animations are subtle and not distracting
- XP rewards provide immediate positive feedback
- Goals are achievable and encouraging, not overwhelming
- Quick access to all main features via the tab selection at the bottom

### 3. Chat Interface (Reflect Screen)

**Visual Design**: 
- RPG-style chat interface with the stone of wisdom gently animated at the top
- Glowing gemstone that glows whenever outputting text with typewriter effect
- Hovering over a royal pillow for valuable gemstone appearance
- Large and clear pixel art design for both gemstone and pillow
- Placeholder sprites for easy replacement with hand-designed UI elements

**Functionality**:
- **Typewriter Effect**: AI responses appear with a left-shifted typewriter effect
- **Crisis Detection**: Automatic scanning of user messages for crisis keywords
- **Prompt Selection**: Pre-written prompts to help users start conversations
- **Conversation History**: Scrollable chat history with clear user/AI distinction via coloring
- **Crisis Response**: Immediate crisis resources when keywords are detected
- **Session Management**: Automatic session creation and management
- **Calendar Integration**: Completed sessions stored and organized via monthly calendar
- **Calendar Access**: Small, theme-matched calendar icon in top right
- **Navigation**: Calendar screen ↔ day screen ↔ individual session screen
- **Month Navigation**: Simple left and right buttons for month navigation

**User Experience**:
- Smooth typewriter animation that's not too slow
- Crisis detection is subtle but effective
- Easy-to-use interface for user to begin and type their input on a newline and left shifted as well
- Clear visual distinction between user and AI messages
- Responsive design that works well with mobile keyboards
- All text should be left shifted
- Initial prompt generates automatically when user switches to screen
- Small placeholder text asks for user response after initial prompt
- Placeholder text and user response in same text container
- Text scrolls upwards with fading effect when overflowing
- Submit via visible button or return key
- Screen scrolls down one line after submission
- LLM generates 3 prompts with validation of user input
- User selects one prompt (text changes color when selected)
- Placeholder text below prompt list for next response
- 4th option to end reflection at each prompt generation
- Sessions saved and accessible via calendar
- Multiple sessions per day supported

**Crisis Integration**:
- Keywords trigger gentle crisis assessment
- Immediate access to emergency resources
- Continues conversation being very strict and clear about not promoting crisis thoughts
- Encouragement to contact professionals in message
- Button suggests utilizing resources screen
- Resources screen includes: crisis resources, DBT/emotional regulation, emergency contacts

### 4. Combined Logging Screen (Meals + Behaviors)

**Visual Design**: 
- Single screen with two main buttons that switch tabs upon selection
- Clean, organized layout with clear visual separation
- Pixel art icons for different meal types and behavior categories

**Functionality**:
- **Tab Navigation**: Two buttons at the top - "Meals" and "Behaviors"
- **Meal Logging Section**:
  - Meal type selection (breakfast, lunch, dinner, snack) with pixel art icons
  - Large text input for meal description
  - Image input for meal images
  - Optional mood selection (how the meal made them feel)
  - Save button
  - All meals of the day accessible below via scrolling
  - Historical meals accessible via calendar icon (similar to chat interface)
- **Behavior Logging Section**:
  - Behavior type selection (triggers, events, coping strategies)
  - Severity level slider (1-10 scale) with theme-matched UI
  - Large text input for behavior description
  - Context selection (time, location, situation)
  - Save button with supportive feedback
  - That day's behaviors list below the input
  - Historical behaviors accessible via calendar icon (similar to chat interface)

**User Experience**:
- Smooth tab switching with animations
- Large, easy-to-tap input areas
- Non-judgmental language throughout
- Encouraging feedback messages
- Quick access to recent entries

**Data Integration**:
- Both meal and behavior data stored in Firestore
- Cross-referencing for pattern analysis
- Privacy-focused data handling
- Easy export for personal/professional review

### 5. Crisis Tools Screen

**Visual Design**: 
- Calm, supportive design with easy access to emergency resources
- Clear, prominent buttons for crisis situations
- Professional appearance that feels trustworthy
- Theme-matched design elements

**Functionality**:
- **Emergency Contacts**: Pre-configured list with one-tap calling
- **Crisis Hotlines**: Direct access to suicide prevention and mental health hotlines
- **DBT Tools**: Quick access to dialectical behavior therapy techniques
- Each DBT tool has its own individual screen
- **Grounding Exercises**: Simple breathing and grounding techniques
- Each grounding exercise has its own individual screen
- **Safety Planning**: Step-by-step safety plan creation
- Safety planning has its own individual screen
- **Professional Resources**: Links to find therapists and treatment centers

**User Experience**:
- Large, easy-to-tap buttons for emergency situations
- Clear, calming language
- Quick access to all resources
- No judgment or pressure
- Encouragement to seek professional help

### 6. Settings Screen

**Visual Design**: 
- Clean, organized settings menu with clear sections
- Professional appearance with easy navigation

**Functionality**:
- **Account Settings**: Profile management, email change, username change, character change, password change
- **Notification Preferences**: Customizable reminders and alerts
- **Privacy Settings**: Data export, account deletion, privacy controls
- **Crisis Settings**: Emergency contact management, crisis preferences
- **App Preferences**: Theme settings, y/n animations, sound settings
- **Help & Resources**: FAQ, support contact, professional resources
- **About**: App information, feedback, disclaimers, professional treatment encouragement

**User Experience**:
- Clear, organized sections
- Easy-to-understand options
- Helpful explanations for each setting
- Quick access to important features
- Professional, trustworthy appearance

## Development Phases

### Phase 1: Foundation
**Goal**: Get basic app structure and all screens and buttons created. Set up auth.

#### Tasks:
1. **Project Setup**
   - Initialize Expo project with TypeScript
   - Set up Firebase project and configuration
   - Configure basic navigation structure
   - Set up development environment

2. **Authentication System**
   - Implement Firebase Auth integration
   - Create login/signup screens with validation
   - Set up AuthProvider context
   - Implement protected routes

3. **Basic Navigation**
   - Set up bottom tab navigation
   - Create placeholder screens for all main features
   - Implement navigation state management

#### Deliverables:
- Working authentication flow
- Basic navigation structure
- Firebase connection established
- Development environment ready

### Phase 2: Core Features
**Goal**: Build the main app features with focus on functionality

#### Tasks:
1. **Chat System**
   - Implement TypewriterText component
   - Create RPG-style chat interface with placeholder UI elements
   - Easy to switch over to hand-designed UI sprites, backgrounds, foreground elements
   - Integrate Hugging Face API for system-prompted LLM responses
   - Implement crisis keyword detection (very simple if-then system)
   - Add conversation history management via calendar functionality

2. **Combined Logging System**
   - Create meal logging functionality
   - Implement behavior/trigger logging
   - Design unified logging interface
   - Add data persistence with Firestore
   - Implement logging history and statistics

3. **Resources System** ✅ **COMPLETED**
   - ✅ Create emergency contact management with call/text/FaceTime
   - ✅ Implement crisis hotlines with predefined numbers
   - ✅ Create safety planning with Firestore integration
   - ✅ Add DBT tools and grounding exercises (placeholders ready)
   - ✅ Professional UI with summary/edit views
   - ✅ Complete Firestore integration with user authentication

#### Deliverables:
- Functional chat with LLM integration
- Complete meal and behavior logging
- ✅ Complete resources system with crisis support tools
- ✅ Firestore data persistence working

### Phase 3: Polish & Design
**Goal**: Make it look professional and polished for demos

#### Tasks:
1. **UI/UX Refinement**
   - Implement pixel art RPG theme throughout
   - Add smooth animations and transitions
   - Optimize for mobile experience

2. **Testing & Optimization**
   - Test on real devices with Expo Go
   - Fix bugs and performance issues
   - Optimize for different screen sizes
   - Ensure accessibility compliance

#### Deliverables:
- Polished, professional app ready for demo
- Smooth user experience
- Consistent visual design
- Performance optimized

## Core Services (Simple Implementation)

### Authentication Service
```typescript
interface AuthService {
  signUp(email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  resetPassword(email: string): Promise<void>;
  updateProfile(updates: Partial<UserProfile>): Promise<User>;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLoginAt: Date;
}
```

### Chat Service
```typescript
interface ChatService {
  sendMessage(content: string): Promise<ChatMessage>;
  getConversationHistory(): Promise<ChatMessage[]>;
  detectCrisis(content: string): CrisisAssessment;
  getCrisisResources(): CrisisResource[];
  createSession(): Promise<string>;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sessionId: string;
}

interface CrisisAssessment {
  isCrisis: boolean;
  severity: 'low' | 'medium' | 'high';
  keywords: string[];
  suggestedActions: string[];
}
```

### Logging Service (Combined Meals + Behaviors)
```typescript
interface LoggingService {
  // Meal logging
  logMeal(meal: MealData): Promise<void>;
  getMeals(filters?: MealFilters): Promise<MealEntry[]>;
  getMealStats(timeframe: TimeFrame): Promise<MealStats>;
  
  // Behavior logging
  logBehavior(behavior: BehaviorData): Promise<void>;
  getBehaviors(filters?: BehaviorFilters): Promise<BehaviorEntry[]>;
  getBehaviorStats(timeframe: TimeFrame): Promise<BehaviorStats>;
  
  // Combined analytics
  getCombinedInsights(): Promise<LoggingInsights>;
}

interface MealData {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  mood?: 'positive' | 'neutral' | 'negative';
  timestamp: Date;
  notes?: string;
}

interface BehaviorData {
  type: 'trigger' | 'pattern' | 'coping';
  description: string;
  severity: number; // 1-10 scale
  context?: string;
  timestamp: Date;
  notes?: string;
}
```

## Firebase Setup (Free Tier)

### Firestore Collections
```typescript
// Users
users: {
  userId: {
    email: string;
    displayName: string;
    createdAt: timestamp;
    lastLoginAt: timestamp;
    preferences: UserPreferences;
  }
}

// Chat Sessions
chatSessions: {
  sessionId: {
    userId: string;
    messages: ChatMessage[];
    createdAt: timestamp;
    updatedAt: timestamp;
  }
}

// Meals
meals: {
  mealId: {
    userId: string;
    type: string;
    description: string;
    mood?: string;
    timestamp: timestamp;
    notes?: string;
  }
}

// Behaviors
behaviors: {
  behaviorId: {
    userId: string;
    type: string;
    description: string;
    severity: number;
    context?: string;
    timestamp: timestamp;
    notes?: string;
  }
}

// Emergency Contacts
emergencyContacts: {
  contactId: {
    userId: string;
    name: string;
    phone: string;
    relationship: string;
    isActive: boolean;
  }
}

// Safety Plans
safetyPlans: {
  planId: {
    userId: string;
    warningSigns: string[];
    copingStrategies: string[];
    socialContacts: string[];
    professionalContacts: string[];
    safeEnvironments: string[];
    emergencyPlan: string;
    updatedAt: timestamp;
  }
}
```

## Design Principles (MVP Focus)

### 1. Simplicity First
- Start with basic functionality that works perfectly
- Focus on user value

### 2. Design Strength
- Professional, polished appearance that builds trust
- Consistent pixel art RPG theme throughout
- Intuitive user interface that requires no training
- Mobile-first design optimized for touch interaction (but should also be able to test on web)

### 3. Safety First
- Crisis detection and appropriate response
- Emergency resource integration throughout
- Professional treatment encouragement
- Clear disclaimers about app limitations

### 4. User Experience
- Non-judgmental language and interactions
- Encouraging, supportive messaging
- Smooth, responsive interface
- Accessible design for all users

## Success Criteria (MVP)

### Functional
- User can create account and login securely
- User can have therapeutic chat conversations with LLM
- User can log meals and behaviors in one interface
- User can access crisis resources immediately
- App detects crisis keywords and responds appropriately

### Design
- Professional, polished appearance suitable for clinical demos
- Intuitive user interface requiring no training
- Consistent pixel art RPG theme throughout
- Mobile-optimized experience on iOS and Android

### Technical
- EXTREMELY SILOED ARCHITECTURE WITH HIGH FLEXIBILITY AND HOT SWAPPABILITY
- Stable, bug-free operation
- Fast, responsive interface
- Works seamlessly on web, iOS, and Android via Expo Go
- Handles errors gracefully with user-friendly messages

## General Instructions

- Have extremely good dev practices. Siloed development, frequent git commits, version control via tagging, start from v0.0.0
- Frequent testing via expo. Should attempt to test every single tiny addition to the project. The goal is to start expo once and just keep reloading my page
- Get dev permission for almost everything you (cursor AI) does. It's very important that you educate the dev with all of your major decisions and why you're doing what you're doing.
- Focus on simplicity. Anything that can be done with less code and fewer dependencies should be done with less code and fewer dependencies. If there is ever a decision to make, offer a suggestion that follows this framework as an alternative along with the consequences.

This MVP roadmap focuses on creating a compelling, functional prototype that demonstrates the app's therapeutic value and potential for impact in eating disorder recovery support.

## Updated Logging System (v0.4.0+)

### Adaptive Logging with LLM Tagging
- The logging screen will feature a single, unlimited-length text input at the top third of the UI.
- User input is submitted and sent to the LLM, which tags the entry with one or more of the following: Breakfast, Lunch, Dinner, Snack, Trigger, Binge, Purge, Body Checking, Exercise, Other.
- Tags are suggested by the LLM but can be manually edited by the user (add/remove tags).
- All logs are displayed and organized by tag and time, in a comprehensible, user-friendly manner.
- The system is designed to be extremely intuitive and adaptive, minimizing friction for the user.
- All log data, along with metadata (timestamp, geolocation, heartrate, etc.), will be stored for future analytics and modeling.
- In future phases, this data will be used to build a detailed analytics and modeling profile for each user, leveraging ML for insights and recommendations.

### Roadmap Adjustments
- Replace separate meal/behavior forms with a unified adaptive logging input.
- Integrate LLM-based tagging and manual tag editing into the logging workflow.
- Plan for future analytics/modeling phase using collected log data and metadata.