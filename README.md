# InteroSight

## Overview

InteroSight is a clinical-grade digital platform for eating disorder recovery, centered on a data-driven, adaptive reflection module system. The application leverages user-generated data, semantic modeling, and guided reflection to facilitate self-understanding and longitudinal insight. The core value proposition is not static education, but the facilitation of meaningful, structured self-reflection through adaptive, evidence-informed modules.

## Core Features

### Home - Progress Tracking
- Progress dashboard visualizing reflective engagement and insight trends
- Streak and engagement tracking
- Achievement and milestone recognition
- Daily goals and progress analytics

### Logging - Adaptive Experience Capture
- Single input for free-form reflection, triggers, and behaviors
- Full metadata capture (time, location, mood, context, physiological data)
- Semantic tagging and pattern recognition
- Historical and calendar-based review

### Reflective Modules - Adaptive Guided Reflection
- Data-driven, adaptive module system
- Each module scaffolds user reflection, not didactic content
- Prompt flows adapt to user data, history, and semantic context
- Session management and longitudinal tracking
- Context-aware, memory-augmented LLM guidance

### Resources - Regulation and Crisis Tools
- Evidence-based emotional regulation and grounding tools
- Crisis resources and emergency contacts
- Safety planning and professional resource links

### Settings
- Account and privacy management
- Notification and crisis settings
- App preferences and accessibility options
- Data export and deletion

## Technical Architecture

### Reflective Module Engine
- Modules are defined as data-driven scaffolds for reflection, not static lessons
- All module content, prompt flows, and progression are dynamically loaded from configuration
- User data, semantic embeddings, and memory are injected into all reflective flows

### Data and Memory Layer
- Persistent user memory with summarized insights and frequent topics
- All reflection and log entries are embedded and indexed for semantic search and analytics
- Contextual data is used to adapt prompts and module progression

### Clinical Safety and Privacy
- Crisis keyword detection and appropriate response
- Risk assessment using validated proxy measures
- Secure, privacy-first data handling and user control

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Firebase project setup
- iOS Simulator or Android Emulator

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Interosight

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Start the development server
npm start
```

### Development
```bash
npm run ios      # Run on iOS
npm run android  # Run on Android
npm run web      # Run on web
```

## Project Structure

```
app/
  src/
    components/          # Reusable UI components
    screens/             # Main app screens
      Home/              # Progress tracking
      Logging/           # Adaptive logging
      LearnReflect/      # Reflective modules
      Resources/         # Regulation and crisis tools
      Settings/          # App configuration
    services/            # Business logic
      modules/           # Module engine
      journaling/        # Reflection system
      embedding/         # Semantic vectors
      memory/            # User memory
      risk/              # Clinical assessment
      progress/          # Analytics
    navigation/          # App navigation
    hooks/               # Custom React hooks
    providers/           # Context providers
    core/                # Types, interfaces, utils
    assets/              # Images, fonts, etc.
  modules/               # Module configurations
  firebase/              # Firebase setup
  tests/                 # Test files
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Describe your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## Clinical Disclaimer

InteroSight is a digital support tool and is not a substitute for professional medical or psychological treatment. Users are encouraged to consult qualified healthcare providers for diagnosis and treatment of eating disorders. The application includes crisis resources and supports professional engagement.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support, contact support@interosight.app or consult the documentation in the docs/ directory. 