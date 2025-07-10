# InteroSight

## Overview

InteroSight is an mHealth application for eating disorder recovery, centered on a data-driven, adaptive reflection module system. The application leverages user-generated data, semantic modeling, and guided reflection to facilitate self-understanding and longitudinal insight. The core value proposition is not static education, but the facilitation of meaningful, structured self-reflection through adaptive, evidence-informed modules that evolve based on user data and engagement patterns.

## Core Features

### Home - Journey-Based Progress & Analytics
- Duolingo-style pathway interface showing reflective modules as a journey
- 5 structured starter modules exploring user identity, relationships, and life fulfillment
- Dynamic module generation based on user data and previous responses
- Interactive journaling with semantic analysis for engagement quality
- Progress visualization and achievement tracking
- Integrated analytics insights and data visualization
- Streak and engagement metrics

### Connect - Clinical and Community Integration
- Clinician oversight and interaction capabilities
- Community features for peer support (future development)
- Professional resource integration
- Crisis intervention and safety planning

### Logging - Dynamic Multi-Modal Capture
- **Freeform Journaling**: Open-ended reflection with semantic tagging
- **Meal Logging**: Food intake tracking with behavioral context
- **Behavior Logging**: Eating disorder behaviors and triggers
- **Dynamic Tagging**: Automatic categorization using contextual analysis
- **Metadata Capture**: Heart rate, step count, geolocation, temporal data
- **Pattern Recognition**: Cross-referencing behaviors with physiological data

### Resources - Regulation and Crisis Tools
- **Emergency & Crisis**: Emergency contacts, crisis hotlines, safety planning
- **Therapeutic Tools**: DBT tools, grounding exercises, coping strategies
- **Professional Support**: Therapist finder, treatment centers, support groups
- **Education & Wellness**: Educational resources, self-care tools

### Settings - App Configuration
- Account and privacy management
- Notification preferences and crisis settings
- App accessibility and customization options
- Data export and deletion controls

## Technical Architecture

### Reflective Module Engine
- **Starter Modules**: 5 formulaic, structured modules exploring user identity and relationships
- **Dynamic Generation**: AI-powered module creation based on user data and themes
- **Engagement Quality**: Semantic analysis to ensure thoughtful responses
- **Adaptive Progression**: Module flows that adapt to user history and context

### Data and Memory Layer
- Persistent user memory with summarized insights and frequent topics
- All reflection and log entries are embedded and indexed for semantic search
- Cross-modal data correlation (behavioral + physiological + contextual)
- Contextual data injection into all reflective flows

### Clinical Safety and Privacy
- Crisis keyword detection and appropriate response
- Risk assessment using validated proxy measures
- Secure, privacy-first data handling and user control
- Professional oversight integration capabilities

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
      Home/              # Journey-based progress & analytics
      Connect/           # Clinical and community features
      Logging/           # Dynamic multi-modal logging
      Resources/         # Regulation and crisis tools
      Settings/          # App configuration
    services/            # Business logic
      modules/           # Module engine and generation
      journaling/        # Reflection and logging system
      embedding/         # Semantic vectors and analysis
      memory/            # User memory and insights
      risk/              # Clinical assessment
      analytics/         # Data visualization and insights
    navigation/          # App navigation
    hooks/               # Custom React hooks
    providers/           # Context providers
    core/                # Types, interfaces, utils
    assets/              # Images, fonts, etc.
  modules/               # Module configurations and themes
  firebase/              # Firebase setup
  tests/                 # Test files
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Describe your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## Disclaimer

InteroSight is a digital support tool and is not a substitute for professional medical or psychological treatment. Users are encouraged to consult qualified healthcare providers for diagnosis and treatment of eating disorders. The application includes crisis resources and supports professional engagement.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support, contact heman.burre@gmail.com or consult the documentation in the docs/ directory. 