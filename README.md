# InteroSight

A compassionate AI companion for eating disorder recovery support, built with React Native and Expo. The app provides a safe, judgment-free space for reflection and emotional support through interactive journaling with support for local Ollama models and mock fallback. The chat system generates real AI responses while maintaining safety protocols for crisis detection.

## Features

- Safe, judgment-free environment for emotional expression and reflection
- Crisis detection and support with immediate resource access
- Real AI-powered responses using local Ollama models
- Dynamic follow-up questions generated based on conversation context
- Session management for tracking progress over time
- Cross-platform (iOS, Android, Web) with React Native and Expo
- Offline-capable with local LLM support

## Current Status

The application has a functional chat interface with prompt-driven conversation flow and improved session management (v0.2.1). LLM integration is implemented with support for local Ollama models and mock fallback. The chat system generates real AI responses while maintaining safety protocols for crisis detection.

## Features

### Authentication
- Secure email/password authentication via Firebase
- Real-time validation and error handling
- Account management with password reset and email verification

### Chat System (LLM Integration)
- Real AI-powered responses using local Ollama models
- Guided, RPG-inspired chat interface with a "Stone of Wisdom" theme
- Conversation is driven by system prompts; user responds directly to each prompt
- Crisis keyword detection with immediate access to support resources
- Conversation history maintained for context-aware responses
- Fallback to mock responses if LLM service is unavailable
- Session history accessible via a calendar view

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

- Architecture: Highly modular, siloed codebase for easy feature swapping and maintenance
- Stack: Expo (React Native), Firebase (Auth & Firestore), TypeScript
- Testing: Designed for rapid iteration and frequent testing on web and mobile
- Design: Pixel art RPG theme, mobile-first, accessible, and professional

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

## LLM Integration

The chat system supports multiple LLM backends:

### Local Ollama Setup (Recommended)

**Quick Setup:**
```bash
# Run the automated setup script
./setup-ollama.sh
```

**Manual Setup:**
1. Install Ollama: https://ollama.ai/
2. Pull a model: `ollama pull llama3.2:1b`
3. Start Ollama server: `ollama serve`
4. The app will automatically connect to `http://localhost:11434`

**Available Models:**
- `llama3.2:1b` (recommended - ~1.3GB)
- `llama2:3b` (good quality - ~2GB)
- `llama2:7b` (better quality - ~4GB)
- `mistral:7b` (good balance - ~4GB)

### Mock Service (Fallback)

If no LLM service is available, the app automatically falls back to mock responses.

### Configuration

The LLM configuration is managed in `app/src/core/config/llm.config.ts`:

```typescript
// Switch between different backends
export const llmConfig: LLMConfig = {
  type: 'ollama', // 'ollama' or 'mock'
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2:1b',
  temperature: 0.7,
  maxTokens: 500,
};
```

### Safety Features

- Crisis Detection: Automatic detection of crisis keywords with immediate support resources
- Professional Boundaries: Clear disclaimers that the AI is not a replacement for professional treatment
- Context-Aware Responses: Tailored for eating disorder recovery support
- Fallback Protection: Always falls back to safe mock responses if LLM fails

## Roadmap

- [x] Authentication and onboarding
- [x] Core chat system with prompt-driven flow (mock implementation)
- [x] Combined meal and behavior logging
- [x] Crisis tools and resources
- [x] Home dashboard and gamification
- [x] End reflection functionality fix (v0.2.1)
- [x] LLM integration (Ollama local)
- [ ] Polish, accessibility, and clinical review
- [ ] Expanded analytics and export features

## Known Issues

- Some UI polish and animations pending

## Disclaimer

InteroSight is a support tool and does not replace professional treatment. Crisis resources are integrated, and users are encouraged to seek professional help as needed. 