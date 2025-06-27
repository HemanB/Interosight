# InteroSight

InteroSight is a mobile-first, cross-platform application designed to support eating disorder recovery through structured reflection, meal and behavior logging, and crisis resources. The app is built with Expo, React Native, and Firebase, and is intended for clinical demonstration and early user feedback.

## Current Status

The application has a functional chat interface with prompt-driven conversation flow, but LLM integration is not yet implemented. The chat currently uses mock responses and prompts.

## Features

### Authentication
- Secure email/password authentication via Firebase
- Real-time validation and error handling
- Account management with password reset and email verification

### Chat System (Mock Implementation)
- Guided, RPG-inspired chat interface with a "Stone of Wisdom" theme
- Conversation is driven by system prompts; user responds directly to each prompt
- Prompts are presented as selectable options; the system outputs the selected prompt and awaits user input
- Crisis keyword detection with immediate access to support resources
- Session history accessible via a calendar view
- **Note: Currently uses mock responses - LLM integration pending**

### Combined Logging
- Unified screen for meal and behavior/trigger logging
- Meal logging includes type, description, optional mood, and image upload
- Behavior logging includes type, severity, context, and description
- Historical logs accessible via calendar

### Crisis Tools
- Immediate access to emergency contacts and crisis hotlines
- DBT (Dialectical Behavior Therapy) tools and grounding exercises
- Safety planning and professional resource links

### Home Dashboard
- Animated RPG-style dashboard with character selection
- XP and streak tracking for engagement
- Daily goals and quick navigation to all main features

### Settings
- Account, notification, privacy, and crisis preferences
- Data export and account deletion
- Help, FAQ, and professional resources

## Technical Overview

- **Architecture:** Highly modular, siloed codebase for easy feature swapping and maintenance
- **Stack:** Expo (React Native), Firebase (Auth & Firestore), TypeScript
- **Testing:** Designed for rapid iteration and frequent testing on web and mobile
- **Design:** Pixel art RPG theme, mobile-first, accessible, and professional

## Development Practices

- Frequent, descriptive commits and version tags
- All major features are developed in isolation and integrated via context providers
- Focus on simplicity, reliability, and user safety
- All crisis-related features are prominent and accessible at all times

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   git clone <repo-url>
   cd InteroSight/app
   npm install
   ```

2. Set up Firebase and update `firebase/config.ts` with your credentials

3. Start the development server:
   ```bash
   npx expo start --web
   ```

4. Test on web or mobile using Expo Go

## LLM Integration (Pending)

The chat system currently uses mock responses. To implement LLM integration:

1. **Local Setup (Recommended for development):**
   - Install Ollama: https://ollama.ai/
   - Pull the model: `ollama pull llama2:3b`
   - Start Ollama server: `ollama serve`
   - Update `src/services/chat/llm.service.ts` to connect to local Ollama instance

2. **Alternative APIs (For production):**
   - OpenAI API integration
   - Hugging Face API integration
   - Update system prompts for eating disorder recovery context

## Roadmap

- [x] Authentication and onboarding
- [x] Core chat system with prompt-driven flow (mock implementation)
- [x] Combined meal and behavior logging
- [x] Crisis tools and resources
- [x] Home dashboard and gamification
- [ ] **LLM integration (Ollama local or API)**
- [ ] **End reflection functionality fix**
- [ ] Polish, accessibility, and clinical review
- [ ] Expanded analytics and export features

## Known Issues

- End reflection button is not functional
- Chat responses are mock data - no actual LLM integration
- Some UI polish and animations pending

## Disclaimer

InteroSight is a support tool and does not replace professional treatment. Crisis resources are integrated, and users are encouraged to seek professional help as needed. 