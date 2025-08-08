# Interosight Documentation

## Overview

Interosight is a therapeutic journaling application that combines structured modules, AI-assisted prompts, and activity tracking to support users in their journey of self-discovery and healing. The application provides a comprehensive platform for eating disorder recovery with data-driven insights and personalized support.

## Current Implementation Status

### ✅ Completed Features
- **Complete Application Foundation**: Modern React + TypeScript + Vite stack with Tailwind CSS
- **Authentication System**: Firebase Auth integration with demo mode support
- **Module System**: Progressive learning with structured journaling prompts
- **Freeform Journaling**: Unstructured journaling with AI follow-up prompts
- **Activity Logging**: Comprehensive meal and behavior tracking with pre/post emotional states
- **History System**: Complete chronological history view with AI-generated summaries
- **AI Integration**: Google AI (Gemini) integration for contextual prompts and summaries
- **Session Management**: Isolated freeform journaling sessions to prevent data bleeding

### 🔄 In Progress
- **Advanced Analytics**: Pattern recognition and insight generation
- **Module Progression**: Dynamic module assignment based on user trajectory
- **Data Visualization**: Progress tracking and trend analysis

### 📋 Planned
- **Reddit Integration**: Data collection and analysis pipeline
- **Machine Learning**: Advanced pattern recognition and personalized insights
- **Mobile App**: React Native implementation for iOS/Android

## Documentation Structure

```
docs/
├── core/                      # Core system documentation
│   ├── ARCHITECTURE.md       # System architecture and design decisions
│   ├── DATA_FLOW.md         # Data flow and state management
│   ├── TECH_STACK.md        # Technology stack and dependencies
│   └── PROGRESS.md          # Current implementation progress
│
├── database/                  # Database documentation
│   ├── STRUCTURE.md         # Database structure and collections
│   └── schemas/             # Data schemas and types
│
├── implementation/           # Implementation guides
│   ├── IMPLEMENTATION_PLAN.md # Development roadmap
│   └── TECHNICAL_GUIDE.md   # Technical implementation details
│
├── live-updates/            # Real-time development updates
├── memory-docs/            # Historical documentation
└── archive/                # Archived documentation
```

## Key Features

### 1. **Module System**
- Progressive learning journey with structured content
- AI-assisted follow-up prompts for deeper reflection
- Word count requirements and progress tracking
- Session-based isolation for data integrity

### 2. **AI Integration**
- Clinical, insight-focused summaries (40 words max)
- Context-aware follow-up prompts
- Safe interaction boundaries with crisis detection
- Real-time summary generation at entry creation

### 3. **Activity Tracking**
- Comprehensive meal and behavior logging
- Pre/post emotional state tracking
- Environmental context (location, social setting)
- Pattern recognition and trend analysis

### 4. **History System**
- Chronological organization with day stratification
- Color-coded entry types for easy identification
- Full entry viewing with conversation threads
- AI-generated summaries for quick insights

### 5. **Data Management**
- Firebase/Firestore backend with secure rules
- Real-time data synchronization
- Efficient querying and filtering
- Session-based data isolation

## Development Guidelines

### 1. **Code Organization**
- Feature-based structure with clear separation
- Type-safe TypeScript implementations
- Modular service architecture
- Consistent error handling

### 2. **Data Management**
- Atomic operations with proper validation
- Consistent schemas across collections
- Efficient queries with proper indexing
- Session-based data isolation

### 3. **User Experience**
- Clean, focused interface design
- Progressive disclosure of features
- Immediate feedback and loading states
- Accessibility and responsive design

## Getting Started

1. **Review Architecture**: See `core/ARCHITECTURE.md` for system overview
2. **Setup Development**: Follow `implementation/TECHNICAL_GUIDE.md` for environment setup
3. **Database Structure**: Review `database/STRUCTURE.md` for data models
4. **Current Progress**: Check `core/PROGRESS.md` for latest implementation status

## Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Firebase/Firestore
- **AI**: Google AI (Gemini) for prompts and summaries
- **Authentication**: Firebase Auth
- **Deployment**: Vercel (web) / Expo (mobile)

## Recent Updates

### Latest Implementation (Current)
- **Comprehensive History System**: Complete chronological view with AI summaries
- **Session Isolation**: Fixed freeform journaling data bleeding issues
- **Clinical AI Summaries**: Objective, insight-focused summaries (40 words max)
- **Enhanced Data Models**: Added llmSummary field to all entry types
- **Modal Entry Viewing**: Full entry details with conversation threads and pre/post data 