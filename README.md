# Interosight

## Overview

Interosight is an mHealth application for eating disorder recovery, blending data-driven insights with a compassionate, engaging user experience. Our long-term vision is to create a Duolingo-style journey for recovery—where users progress through reflective modules, unlock achievements, and see their growth visualized as a meaningful path. The app combines structured journaling, behavioral logging, and actionable insights to empower users on their unique recovery journeys.

## MVP Core Features

1. **Base Modules**
   - Three foundational modules for onboarding, identity, and recovery journey
   - Each module contains reflective journaling submodules
2. **Dynamically Assigned Modules**
   - Three modules assigned based on user recovery trajectory (Daily Impact, Interpersonal Impact, Emotional Landscape)
3. **Logging Meals/Behaviors**
   - Users can log meals and behaviors with image and text input
   - Ability to review previous entries and preserve time metadata
4. **Database for User Raw Data**
   - Secure storage of high-resolution time-series journaling and logging entries (text and images)
   - MVP uses Firebase/Firestore
5. **Database for User Vectorized Data**
   - Stores vectorized representations of user events for analysis and ML tasks
   - Enables efficient time-series analysis and user profiling
6. **Insight Output**
   - Analytical engine generates insights, patterns, and feedback for users
   - Dynamic recommendations and notifications based on user data

## Project Prongs

1. **Data Collection**
   - Collect longitudinal user data from Reddit using PRAW
   - Store raw and processed data stratified by user
2. **Data Analysis (Insight Engine)**
   - Develop pipeline to process, vectorize, and analyze user data
   - Generate longitudinal insights and behavioral patterns
3. **Frontend & App Development**
   - User-facing app for journaling, logging, and insight delivery
   - Integrate with backend data and insight APIs
   - Secure, efficient database integration (Firebase/Firestore)

## Technical Stack

- **Frontend:** React Native (Expo)
- **Backend:** Firebase/Firestore
- **Data Collection:** Reddit PRAW (Python)
- **Data Analysis:** Python (vectorization, insight engine)

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Firebase project setup

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Interosight
npm install
# Set up environment variables for Firebase
```

### Development
```bash
npm run ios      # Run on iOS
npm run android  # Run on Android
npm run web      # Run on web
```

## Data & Privacy
- All user data is securely stored and privacy is prioritized
- Users control their data and can export/delete entries
- No data is shared without explicit consent

## Future Vision

- **Duolingo-Style Journey:** The finished product will feature a gamified, visually engaging journey where users unlock modules, celebrate milestones, and see their progress mapped as a path to recovery.
- **Personalized Growth:** Adaptive modules and insights will respond to each user's unique story, supporting them with empathy and evidence-based guidance.
- **Community & Support:** Long-term, we envision integrating peer support, clinician tools, and a vibrant, supportive community.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Disclaimer
Interosight is a digital support tool and not a substitute for professional medical or psychological treatment. Consult qualified healthcare providers for diagnosis and treatment of eating disorders.

## License
Apache License 2.0. See LICENSE for details.

## Support
Contact heman.burre@gmail.com for support. 