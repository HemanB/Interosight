# InteroSight

## Overview

InteroSight is an mHealth application for eating disorder recovery, centered on a data-driven, time-series embedding system that learns from users' lived experiences. The application leverages structured journaling, comprehensive metadata capture, and behavioral logs to create personalized, reflective insights for eating disorder recovery. The long-term goal is to enable self-referential learning, especially valuable for egosyntonic conditions like eating disorders.

## Core Vision: Time-Series Embedding System

### Data-Driven Personalization
- **Longitudinal Data Collection**: Structured journaling with tags, timestamps, and emotional tone analysis
- **Comprehensive Metadata Capture**: Time of day, frequency, completion patterns, interaction behaviors
- **Behavioral Tracking**: User engagement patterns, log completion rates, feature usage analytics
- **Self-Referential Learning**: System learns from each user's unique recovery journey

### MVP Strategy: Rule-Based Foundation
To break the cold-start problem, we're shipping a rule-based, insight-driven MVP that provides immediate value while collecting the longitudinal data needed for future ML models:

- **Structured Journaling**: Tags, timestamps, emotional tone analysis
- **Basic NLP Extraction**: Sentiment, emotion, keyword topic extraction
- **Behavioral Analytics**: Time patterns, frequency analysis, engagement metrics
- **Simple Visualizations**: Weekly reflection summaries and progress tracking
- **Immediate Value**: Users get insights and motivation while passively contributing to the data foundation

## Core Features

### Home - Journey-Based Progress & Analytics
- Duolingo-style pathway interface showing reflective modules as a journey
- 5 structured starter modules with 3 submodules each (15 total submodules)
- Dynamic module generation based on user data and previous responses
- Interactive journaling with semantic analysis for engagement quality
- Progress visualization and achievement tracking
- Integrated analytics insights and data visualization
- Streak and engagement metrics

### Logging - Dynamic Multi-Modal Capture
- **Structured Journaling**: Tagged entries with timestamps and emotional tone
- **Freeform Journaling**: Open-ended reflection with semantic tagging
- **Meal Logging**: Food intake tracking with behavioral context
- **Behavior Logging**: Eating disorder behaviors and triggers
- **Dynamic Tagging**: Automatic categorization using contextual analysis
- **Comprehensive Metadata**: Heart rate, step count, geolocation, temporal data, interaction patterns
- **Pattern Recognition**: Cross-referencing behaviors with physiological data

### Resources - Regulation and Crisis Tools
- **Emergency & Crisis**: Emergency contacts, crisis hotlines, safety planning
- **Therapeutic Tools**: DBT tools, grounding exercises, coping strategies
- **Professional Support**: Therapist finder, treatment centers, support groups
- **Education & Wellness**: Educational resources, self-care tools

### Connect - Clinical and Community Integration
- Clinician oversight and interaction capabilities
- Community features for peer support (future development)
- Professional resource integration
- Crisis intervention and safety planning

### Settings - App Configuration
- Account and privacy management
- Notification preferences and crisis settings
- App accessibility and customization options
- Data export and deletion controls

## Technical Architecture

### Data Collection & Metadata Capture
- **Structured Journaling**: Tagged entries with timestamps, emotional tone, and context
- **Interaction Metadata**: Time of day, session duration, feature usage, completion patterns
- **Behavioral Analytics**: Frequency analysis, engagement patterns, log completion rates
- **Physiological Data**: Heart rate, step count, geolocation when available
- **Temporal Patterns**: Day of week, time patterns, seasonal variations

### Rule-Based Insight Engine (MVP)
- **NLP Processing**: Sentiment analysis, emotion detection, keyword extraction
- **Pattern Recognition**: Simple rule-based pattern identification
- **Weekly Summaries**: Automated reflection summaries and progress tracking
- **Engagement Analytics**: User behavior analysis and motivation insights

### Future ML Foundation
- **Time-Series Embeddings**: Longitudinal data modeling for personalized insights
- **Self-Referential Learning**: System learns from each user's unique patterns
- **Predictive Analytics**: Early warning systems and personalized recommendations
- **Adaptive Content**: Dynamic module generation based on learned patterns

### Reflective Module Engine
- **Starter Modules**: 5 formulaic, structured modules exploring user identity and relationships
- **Dynamic Generation**: AI-powered module creation based on user data and themes
- **Engagement Quality**: Semantic analysis to ensure thoughtful responses
- **Adaptive Progression**: Module flows that adapt to user history and context

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
      metadata/          # Comprehensive metadata capture
      nlp/               # NLP processing and analysis
    navigation/          # App navigation
    hooks/               # Custom React hooks
    providers/           # Context providers
    core/                # Types, interfaces, utils
    assets/              # Images, fonts, etc.
  modules/               # Module configurations and themes
  firebase/              # Firebase setup
  tests/                 # Test files
```

## Data Strategy

### Immediate Value (MVP)
- Rule-based insights and weekly summaries
- Basic pattern recognition and progress tracking
- User engagement analytics and motivation features
- Simple visualizations and reflection prompts

### Long-term Vision
- Time-series embedding models trained on real recovery journeys
- Self-referential learning systems for personalized insights
- Predictive analytics for early intervention
- Adaptive content generation based on learned patterns

### Privacy & Ethics
- User-controlled data sharing and export
- Transparent data usage and purpose
- Secure, encrypted data storage
- Compliance with healthcare privacy regulations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Describe your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## Disclaimer

InteroSight is a digital support tool and is not a substitute for professional medical or psychological treatment. Users are encouraged to consult qualified healthcare providers for diagnosis and treatment of eating disorders. The application includes crisis resources and supports professional engagement.

## License

This project is licensed under the Apache License 2.0. See the LICENSE file for details.

## Support

For support, contact heman.burre@gmail.com or consult the documentation in the docs/ directory. 