# InteroSight Mobile App

A React Native mobile application designed to support individuals in eating disorder recovery through LLM-powered therapeutic chat, non-judgmental meal logging, and crisis-aware design.

## Features

### 🏠 Home Screen
- **Gamification Elements**: Streak tracking, XP system, level progression
- **Daily Goals**: Interactive to-do list with XP rewards
- **Quick Actions**: Easy access to meal logging, chat, and self-care
- **Mascot Animations**: Duolingo-style animated mascot for emotional engagement

### 💭 Reflect & Chat
- **LLM Integration**: Hugging Face API-powered therapeutic conversations
- **Crisis Detection**: Automatic detection of crisis keywords with appropriate responses
- **Real-time Chat**: Live conversation with mascot animations during processing
- **Crisis Support**: One-tap access to emergency resources

### 🍽️ Meal Logging
- **Non-judgmental Design**: Focus on descriptions rather than calories
- **Meal Types**: Breakfast, lunch, dinner, and snack categorization
- **Supportive Messaging**: Encouraging feedback and gentle reminders
- **Recent History**: View and reflect on past meal logs

### ⚠️ Triggers & Patterns
- **Crisis Tools**: Emergency contacts and DBT techniques
- **Trigger Logging**: Track triggers with severity levels
- **Coping Strategies**: Document what helps during difficult moments
- **Risk Escalation**: One-tap access to suicide prevention resources

### 👥 Community (Coming Soon)
- **Safety-First Design**: Community features designed with user safety in mind
- **Recovery Stories**: Inspiring stories from others on their journey
- **Support Groups**: Safe, moderated environments
- **Resource Sharing**: Helpful coping strategies and resources

### ⚙️ Settings
- **Notification Preferences**: Customizable reminders and alerts
- **Crisis Resources**: Quick access to emergency contacts
- **Privacy Controls**: Data export and account deletion options
- **App Customization**: Theme and mascot animation settings

## Technical Stack

- **React Native** with Expo
- **React Navigation** for bottom tab navigation
- **Firebase** for authentication and data storage
- **Hugging Face API** for LLM integration
- **TypeScript** for type safety
- **Custom Animations** for mascot and micro-interactions

## Project Structure

```
app/
├── components/
│   └── Mascot.tsx              # Animated mascot component
├── contexts/
│   └── AuthContext.tsx         # Firebase authentication context
├── lib/
│   ├── firebase.ts             # Firebase configuration
│   └── llm.ts                  # Hugging Face LLM service
├── predictive/
│   └── engine.ts               # Pattern analysis and insights
├── prompts/
│   └── prompts.ts              # Centralized LLM prompts
├── screens/
│   ├── HomeScreen.tsx          # Main dashboard
│   ├── ReflectScreen.tsx       # LLM chat interface
│   ├── MealsScreen.tsx         # Meal logging
│   ├── TriggersScreen.tsx      # Crisis tools and triggers
│   ├── CommunityScreen.tsx     # Community features
│   └── SettingsScreen.tsx      # App settings
└── App.tsx                     # Main app component
```

## Key Design Principles

### 🛡️ Safety-First
- Crisis detection and appropriate resource provision
- No triggering content about calories or specific behaviors
- Emergency contact integration throughout the app
- Professional treatment encouragement

### 💙 Empathetic Design
- Non-judgmental language and interactions
- Gentle, supportive messaging
- Mascot animations for emotional engagement
- Focus on progress over perfection

### 🎮 Gamification
- Streak tracking for consistency
- XP rewards for positive behaviors
- Level progression system
- Achievement celebrations

### 🔒 Privacy & Security
- Local data storage options
- No tracking of sensitive information
- User control over data export/deletion
- Secure Firebase integration

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd app
   npm install
   ```

2. **Environment Configuration**
   - Add your Hugging Face API key to environment variables
   - Configure Firebase project settings

3. **Run the App**
   ```bash
   npm start
   ```

4. **Development**
   - Use Expo Go app for testing on physical devices
   - Run on iOS simulator or Android emulator

## LLM Integration

The app uses Hugging Face's inference API for therapeutic conversations. The LLM is prompted with:

- **System Prompt**: Defines the AI's role as a supportive companion
- **Crisis Detection**: Keywords trigger appropriate safety responses
- **Contextual Responses**: Maintains conversation history for continuity
- **Fallback Handling**: Graceful degradation when API is unavailable

## Crisis Support Features

- **Automatic Detection**: Scans messages for crisis keywords
- **Immediate Resources**: Provides emergency contact information
- **DBT Tools**: Dialectical Behavior Therapy techniques
- **Risk Escalation**: Direct access to suicide prevention hotlines

## Future Enhancements

- [ ] Dark mode support
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Community features
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Integration with treatment providers

## Contributing

This app is designed for eating disorder recovery support. All contributions should prioritize:

1. **User Safety**: Never compromise on crisis support features
2. **Recovery-Focused**: Support healing, not harmful behaviors
3. **Professional Boundaries**: Encourage professional treatment
4. **Inclusive Design**: Accessible to all users

## License

This project is designed for therapeutic support and should be used responsibly in conjunction with professional treatment.
