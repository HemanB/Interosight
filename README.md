# Intero: A Reflective RPG for Eating Disorder Recovery

**Intero** is a narrative-driven, LLM-powered journaling app that transforms recovery into a deeply personal, quest-like journey. It blends therapeutic reflection, daily habit-building, and symbolic exploration into an emotionally immersive RPG experience.

## 🧠 Concept Overview

- **Core Metaphor**: The user reclaims a fragmented inner world by journaling, learning, and completing daily quests. Their growth is visualized as a "Tree of Wisdom" and a progressively revealed map.
- **Target Audience**: Individuals in ED recovery (especially 16–29), seeking emotional safety, structure, and motivation without calorie tracking or clinical rigidity.
- **Core Design Pillars**: 
  - Reflection over compliance
  - Symbolic over literal gamification
  - Emotional resonance over productivity metrics

## 🧱 App Architecture Overview

### 🌿 Primary Tabs / Screens

| Screen | Purpose | Status |
|--------|---------|--------|
| `Home` | Hub screen featuring the user's character, daily quests, XP meter, and Tree of Wisdom | ✅ Implemented |
| `Stone of Wisdom` | LLM-powered reflection interface generating daily MI-style prompts and dynamic follow-ups | ✅ Implemented |
| `Tracking` | Simple trigger + meal logging (no calories); used to inform patterns and decay mechanics | ✅ Implemented |
| `Explore` | Map-based activity progression system; user completes reflection/education nodes tied to ED themes | ✅ Implemented |
| `Community` | Peer-to-peer journaling pods (future); community stats and shared quests | 🔲 Planned |
| `Settings` | Personalization, character selection, notification preferences, export data | 🔲 Planned |

## 🗺️ Core Game Systems

### 🧭 Explore Map
- Connected node-based path resembling Duolingo
- Each node = short interactive activity (reflection, myth-busting, educational)
- Unlocks expand the map visually
- Completed nodes influence region vitality and progress

### 🪞 Tree of Wisdom (LLM-Driven)
- Grows dynamically as users reflect
- Branches represent themes (e.g., body image, identity, shame, control)
- Nodes are built based on LLM-extracted tags from user reflections
- Users can revisit any past branch, expand it, or reflect deeper

### 📆 Reflection Calendar
- Archives all past reflections
- Each entry includes:
  - Prompt of the day
  - User's response
  - Optional follow-up questions
  - Associated tags and region/themes
- Users can revisit or re-engage with any entry

## 💬 Daily Reflection Flow

1. User gets notification for or sees reflection in quests list and taps the **Stone of Wisdom** tab
2. LLM generates a daily prompt (from a vetted prompt bank or dynamically)
3. User responds freely
4. LLM:
   - Tags emotional/reflective themes
   - Suggests 2–3 follow-up prompts (based on the content of the response primarily but also the themes identified)
   - User is able to stop at any point in this process and can choose to keep going on forever if they want.
   - Logs entry to calendar
5. If topic aligns with an explored region → that region is "protected" from decay
6. User gains XP based on emotional richness (not length or behavior)

## 🏡 Home Screen Components

- Animated character (e.g., resting at campfire)
- Visual XP/level indicator
- Daily quest list:
  - Reflect with the Stone of Wisdom
  - Log a meal or trigger
  - Optional map activity
- Streak counter
- Tree of Wisdom visualization
- Bottom tab navigation

## 🔐 Clinical Philosophy

- No calorie or weight tracking (VERY IMPORTANT)
- No binary "success/failure" mechanics (VERY IMPORTANT)
- Relapse is symbolized via region decay — not as failure, but as an invitation to return and re-reflect
- LLM-generated content adheres to motivational interviewing and narrative therapy principles
- Crisis support always accessible (VERY IMPORTANT)

## 🚧 Development Status

### ✅ Completed (MVP)
- [x] Base navigation + Home screen with Tree of Wisdom
- [x] Stone of Wisdom reflection interface
- [x] Daily quest system with XP rewards
- [x] Character progression (Wanderer → Seeker → Explorer → Sage)
- [x] Simple tracking system (meals/triggers without calories)
- [x] Map-based Explore system with regions and nodes
- [x] Reflection calendar storage and viewing

### 🔲 In Progress
- [ ] LLM integration for dynamic follow-up questions
- [ ] Tree of Wisdom growth based on reflection tags
- [ ] Region vitality decay mechanics
- [ ] Character customization options

### 🔲 Post-MVP Vision
- [ ] Add multiple emotional regions (body dysmorphia, shame, control, identity, emotional distress)
- [ ] Introduce seasonality (shifting map themes and quests)
- [ ] LLM-curated dream regions based on user reflection history
- [ ] Community co-reflection loops (optional peer sharing)
- [ ] Personalization of Stone voice/tone (e.g., gentle vs inquisitive)

## 🛠️ Technical Stack

### Mobile App
- **React Native with Expo** - Cross-platform mobile development
- **Firebase Backend** - Authentication, Firestore database, real-time features
- **Bottom Tab Navigation** - Home, Stone of Wisdom, Tracking, Explore, Community, Settings
- **Mascot-driven UI** - Engaging interface with therapeutic animations

### AI Model (Future Integration)
- **Base Model**: Meta-Llama-3.1-8B-Instruct
- **Fine-tuning**: QLoRA with 4-bit quantization
- **Training Data**: Reddit posts from eating disorder communities + synthetic MI responses
- **Multi-label Support**: Handles body image, self-worth, relationships simultaneously

## 🚀 Quick Start

### Environment Setup
```bash
conda activate interosight
pip install -r requirements.txt
```

### Mobile App Development
```bash
cd app
npm install
npx expo start
```

## 📱 Key Features

### Mobile App
- **Stone of Wisdom**: Daily reflection prompts with follow-up questions
- **Tree of Wisdom**: Visual growth tracking across different themes
- **Explore Map**: Node-based activity progression system
- **Simple Tracking**: Text-based meal/trigger logging without calories
- **Character Progression**: RPG-style leveling and title system
- **Crisis Safety**: Emergency contacts and mental health hotlines

### AI Pipeline (Future)
- **Intelligent Filtering**: Relevance scoring for clinically valuable content
- **Performance Optimized**: 99.6% faster processing (regex vs LLM)
- **Quality Control**: Automated filtering for inappropriate content
- **Scalable Processing**: Batch handling for large datasets

## 📊 Repository Structure

```
interosight/
├── data/                   # Data processing pipeline
├── models/                 # Model definitions and inference
├── training/               # Training scripts and configs
├── evaluation/             # Model evaluation and testing
├── utils/                  # Utility functions
└── docs/                   # Documentation and flowcharts

app/                        # React Native mobile application
├── components/             # Reusable UI components
├── screens/               # Main app screens
├── navigation/            # React Navigation setup
├── lib/                   # Firebase and LLM integration
└── assets/                # Images, fonts, animations
```

## 🎯 Technical Notes

- **Performance**: Regex-based text cleaning reduces processing time from 117+ hours to 30 minutes
- **Clinical Focus**: Designed specifically for eating disorder recovery contexts
- **Safety First**: Built-in crisis tools and emergency escalation procedures
- **Cross-platform**: Works on iOS, Android, and web
- **RPG Elements**: Character progression, quest system, and symbolic growth visualization

## 📚 Documentation

Detailed app flowcharts and screen layouts are available in `docs/`:
- `app_flowchart.puml` - Complete user journey diagram
- `screen_flow_diagram.puml` - Detailed UI component layouts

View with any PlantUML renderer.

---

> Intero invites users to build inner safety, insight, and self-trust — one reflection at a time.
