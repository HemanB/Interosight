# InteroSight: Project Holy Grail

## Project Direction & MVP Focus

The goal is to deliver a Minimum Viable Product (MVP) for InteroSight, focusing on the following core features:

### 1. Base Modules
- Core building blocks of the application, providing essential functionality for user onboarding and engagement.
- Each module has a set of submodules. Each submodule should be a full reflective journaling entry.
- There are 3 base modules: 
    - Module 1: Introduction
        - Setting the stage for recovery
            - Explains all data privacy stuff
            - Collects demographic data and other salient information about the user
            - Has a tutorial/walkthrough of all the app features
            - Asks a few reflective journaling questions to get the ball rolling
                - Examples could include:
                    - "What brings you here today?"
                    - "What would you like this space to help you with?"
                    - "How are you feeling about starting this?"
                    - "If this journaling space had a voice, what would you want it to say back to you?"
    - Module 2: Identity
        - Who the user is beyond the eating disorder
            - Discusses the importance of identity and eating disorder
            - Reflective journaling designed to build refelection on identity in context of ED
                - Examples could include:
                    - "What roles do you play in your life? Which feel most authentic to you?"
                    - "What values guide your decisions or relationships?"
                    - "When do you feel most like yourself?"
                    - "What's something others might not see about you that you wish they did?"
    - Module 3: Your Journey
        - Delving into what brought the user here
        - Past attempts at recovery and what those looked/felt like
        - The concept of starting/restarting recovery and meaning in that
            - Reflective journaling to frame this and cement this
                - Examples could include:
                    - "Why now? Why are you engaging with this tool at this point in your journey?"
                    - "What does 'getting better' mean to you?"
                    - "When did you first start noticing something felt off?"
                    - "What has helped or hurt your recovery efforts so far?"

### 2. Dynamically Assigned Modules
- Modules that are assigned to users based on their recovery trajectory
- There are currently 3 dynamic modules in development
- These are less set in stone:
    - Module 4: Daily Impact
        - Designed to help the user contextualize impact on daily life
        - Examples of reflective journaling prompts include:
            - "How does your eating disorder affect your daily life?"
            - "What do you miss most about life before the ED?"
            - "Are there things you avoid because of your symptoms?"
            - "What's one thing you wish you could do more freely?"
    - Module 5: Interpersonal Impact
        - Assess impact of eating disorder on relationships and connection
        - Examples of reflective journaling prompts include:
            - "Has your ED changed how you show up in relationships?"
            - "Who do you feel safest with? Why?"
            - "Are there things you hide from people you care about?"
            - "How do you think your loved ones understand what you're going through?"
    - Module 6: Emotional Landscape
        - Assess emotional cognition/interpretation
        - Examples of reflective journaling prompts include:
            - "What emotions feel hardest to sit with?"
            - "How do you usually respond when you're overwhelmed?"
            - "What does your inner voice sound like when things go wrong?"
            - "What helps you feel grounded or soothed?"

### 3. Logging Meals/Behaviors
- Mechanism for users to log meals and behaviors, forming the foundation for data-driven insights.
    - Must have image input
    - Must have text input
    - Must have the ability to look back on previous entries
    - Must conserve metadata, especially time metadata
    - Must also have a quick emotional/feelings reflection pre/post events
    - Must be able to add retrospective entries

### 4. Database to Store User Raw Data
- A robust database to store all user-submitted raw data securely and efficiently.
    - This database must efficiently store high resolution time-series journaling and logging entries
        - This will require image storage capabilities
        - This will also required text storage capabilities
    - The exact implementation for this is still up in the air
    - The goal is to user Firebase/Firestore for the MVP
        - How do we optimally implement a database solution with these constraints and design criteria? TASK

### 5. Insight Output for User Behaviors & Patterns
- Analytical engine to generate insights, patterns, and feedback for users based on their logged data.
- We want to basically leverage all the input the user has given us to its fullest extent:
    - These outputs can be things like notifications to the user for reflection on things like:
        - Therapy sessions
        - Binge/purge/compensatory events
    - These outputs can be things like reflections recommended based on time-of-day or time-of-week
    - Dynamic Module recommendations
        - Further prompt recommendations within modules and submodules
    - Brainstorm further simple but valuable elements to offer with the MVP TASK
- USE A BASIC SYSTEM PROMPTED LLM FOR THIS!!!!

---

## Current Project Status (Updated January 2024)

### COMPLETED - Phase 1: Application Foundation
- **Modern Tech Stack:** Vite + React + TypeScript + Tailwind CSS
- **Core Screens Implemented:** All 6 main screens with functional navigation
  - AuthScreen: Complete authentication UI with sign-in/sign-up flows
  - HomeScreen: Dashboard with functional navigation and progress tracking
  - LogScreen: Comprehensive meal/behavior logging with all required fields
  - HistoryScreen: Progress tracking and data visualization interface
  - SettingsScreen: Complete settings management with profile, privacy, and data tabs
  - FreeformJournalScreen: Functional freeform journaling with word counting
  - ModuleScreen: Functional module progression with journaling interface
- **Design System:** Custom Tailwind configuration with olive green theme
- **Navigation:** Desktop-first sidebar navigation with functional screen switching
- **Development Environment:** Fully operational with hot module replacement

### COMPLETED - Phase 2: Functional Implementation
- **Navigation System:** Complete functional navigation between all screens
- **Interactive HomeScreen:** All action cards functional with proper navigation
- **Module System:** Introduction module with 4 submodules and structured journaling
- **Journaling Interface:** Freeform journaling with word counting and save functionality
- **Fresh Account Experience:** Clean slate for new users with proper onboarding
- **Settings Management:** Complete settings interface with profile, privacy, and data tabs

### CURRENT - Phase 3: Backend Integration
**Next Priority Tasks:**
1. **Firebase Integration:** Initialize Firebase services (Auth, Firestore, Storage)
2. **Authentication System:** Connect AuthScreen to Firebase Auth
3. **Data Persistence:** Implement real data storage for journaling and logging
4. **Form Validation:** Add proper validation to all input forms

### UPCOMING - Phase 4: Feature Enhancement
**Planned Features:**
1. **Real Journaling System:** Connect to Firebase with LLM integration
2. **Functional Logging:** Implement meal/behavior logging with data persistence
3. **Analytics Engine:** Real data visualization and pattern recognition
4. **Module System:** Complete module progression and content delivery
5. **Demo Mode:** Sample data and tutorial functionality for Reddit launch

### MVP TARGET FEATURES
Based on current implementation status, the MVP should focus on:
1. **User Authentication & Profile Management** (AuthScreen ready)
2. **Comprehensive Logging System** (LogScreen UI complete, needs backend)
3. **Progress Tracking & History** (HistoryScreen ready for real data)
4. **Settings & Preferences** (SettingsScreen complete)
5. **Basic Analytics** (placeholder screens ready for real implementation)

---

## Project Prongs

This document will be expanded to fully flesh out each prong. For now, the three main prongs (in order of priority) are:

### 1. Data Collection Prong
- **Goal:** Collect relevant longitudinal user data from Reddit (initially Reddit using PRAW) leveraging reddit post/comment timestamping to generate time-series text databases for users. Users with time periods with low-data sparsity will be selected for analysis and will be used to train, test, and validate the longitudinal insight engine's predictive and modeling performance.
- **New Emphasis:**
  - Explicitly generate per-user, longitudinal journaling timelines (aggregating both posts and comments) to serve as a proxy for app-based journaling data.
  - These timelines will be the foundation for all downstream semantic, behavioral, and recovery trajectory analyses.
- **Tasks:**
  - Implement Reddit data collection pipeline
  - Store raw data from major subreddits
  - Store processed data with longitudinal data stratified by user
  - Ensure all data is suitable for high-resolution, time-series analysis and EDA

### 2. Data Analysis Prong (Longitudinal Insight Engine)
- **Goal:** Analyze collected data to extract longitudinal insights, trends, and behavioral patterns, with a focus on understanding the semantic and recovery trajectories of users over time.
- **Core EDA Axes:**
  - Temporal Analysis (activity frequency, gaps, intervals)
  - Content & Topic Analysis (LDA/BERTopic, topic evolution, subreddit diversity)
  - Linguistic & Sentiment Features (sentiment/emotion trends, verbosity, lexical richness)
  - Narrative Trajectory (pronoun shifts, self-referential phrases, agency/helplessness)
  - Recovery-Relevant Markers (recovery term frequency, motivation/denial, insight quotes)
  - Prompt Suitability (segments for journaling, implicit prompts)
- **Tasks:**
  - Develop data processing and vectorization pipeline
  - Build insight generation and reporting frameworks to output to the user
  - Use EDA findings to inform prompt/module design and future analytical tool development

### 3. Frontend & App Development Prong
- **Goal:** Develop the main user-facing application for data logging, insight delivery, and user interaction.
- **Current Status:** Foundation complete with all core screens implemented and functional
- **Next Tasks:**
  - Integrate with backend data and insight APIs and modules
  - Establish efficient and secure database system using Firebase/Firestore
  - Implement real functionality for all wireframe screens

---

> **NOTE:** This document is the central reference for the project's direction and priorities. All major architectural and development decisions should align with the vision and scope outlined here. DO NOT EDIT THIS DOCUMENT. THIS DOCUMENT SHOULD REMAIN UNCHANGED FOR ETERNITY.

---

*Add further details, diagrams, and specifications as the project evolves.* 