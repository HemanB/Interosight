# InteroSight Mobile Application

A React Native mobile application built with Expo and TypeScript, designed to support eating disorder recovery through therapeutic chat, meal logging, and crisis-aware design.

## Overview

InteroSight provides a comprehensive platform for individuals in eating disorder recovery, featuring LLM-powered therapeutic conversations, non-judgmental meal tracking, and integrated crisis support tools.

## Core Features

### Authentication & Security
- Firebase Authentication with email/password
- Biometric authentication support
- Secure user profile management
- Privacy-focused data handling

### Home Dashboard
- Recovery streak tracking
- XP-based gamification system
- Daily goal management
- Quick access to core features

### Therapeutic Chat
- Hugging Face API integration for LLM conversations
- Crisis keyword detection and response
- Real-time chat with animated mascot
- Emergency resource integration

### Meal Logging
- Non-judgmental meal description system
- Categorized meal types (breakfast, lunch, dinner, snacks)
- Supportive feedback and encouragement
- Historical meal tracking

### Crisis Support
- Emergency contact management
- DBT (Dialectical Behavior Therapy) tools
- Trigger logging and severity tracking
- Suicide prevention resource integration

### Settings & Preferences
- Notification management
- Privacy controls and data export
- Theme customization
- Biometric authentication settings

## Technical Architecture

### Technology Stack
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI Integration**: Hugging Face Inference API
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data

### Project Structure
```
app/
├── components/           # Reusable UI components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── lib/                 # Core services and utilities
├── navigation/          # Navigation configuration
├── screens/             # Screen components
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
└── App.tsx             # Main application component
```

### Key Design Principles

#### Safety-First Approach
- Crisis detection and appropriate resource provision
- No triggering content about calories or specific behaviors
- Emergency contact integration throughout the application
- Professional treatment encouragement

#### User Experience
- Non-judgmental language and interactions
- Supportive messaging and feedback
- Animated mascot for emotional engagement
- Focus on progress over perfection

#### Privacy & Security
- Local data storage options
- No tracking of sensitive information
- User control over data export and deletion
- Secure Firebase integration

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd app
   npm install
   ```

2. **Environment Configuration**
   - Configure Firebase project settings in `lib/firebase.ts`
   - Add Hugging Face API key to environment variables
   - Set up biometric authentication (optional)

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Platform-Specific Development**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Authentication System

The application uses Firebase Authentication with the following features:

- Email/password registration and login
- Biometric authentication (Face ID, Touch ID, fingerprint)
- Secure user profile management
- Password reset functionality
- Account deletion with data cleanup

### Firebase Configuration
Firebase is initialized in `lib/firebase.ts` with proper error handling and fallback mechanisms for offline functionality.

## API Integration

### Hugging Face LLM Service
- Therapeutic conversation generation
- Crisis keyword detection
- Contextual response management
- Graceful API failure handling

### Crisis Support Integration
- Emergency contact management
- DBT technique integration
- Suicide prevention resource access
- Real-time crisis assessment

## Development Guidelines

### Code Organization
- Modular component architecture
- Separation of concerns
- TypeScript for type safety
- Consistent naming conventions

### State Management
- React Context for global state
- Local state for component-specific data
- AsyncStorage for persistent local data
- Firebase for cloud synchronization

### Error Handling
- Graceful degradation for network issues
- User-friendly error messages
- Comprehensive logging for debugging
- Fallback mechanisms for critical features

## Testing

### Manual Testing
- Authentication flow testing
- Cross-platform compatibility
- Offline functionality verification
- Crisis support feature validation

### Development Testing
- Expo Go for physical device testing
- iOS Simulator for iOS-specific features
- Android Emulator for Android-specific features
- Web browser for web platform testing

## Deployment

### Build Configuration
- Expo managed workflow
- Platform-specific optimizations
- Environment-specific configurations
- Asset optimization

### Distribution
- App Store (iOS)
- Google Play Store (Android)
- Web deployment (optional)

## Contributing

### Development Standards
1. **Safety First**: Never compromise on crisis support features
2. **Recovery-Focused**: Support healing, not harmful behaviors
3. **Professional Boundaries**: Encourage professional treatment
4. **Inclusive Design**: Ensure accessibility for all users

### Code Review Process
- TypeScript compliance verification
- Firebase authentication integrity checks
- Cross-platform compatibility testing
- Security and privacy review

## License

This project is designed for therapeutic support and should be used responsibly in conjunction with professional treatment. All development should prioritize user safety and recovery outcomes.
