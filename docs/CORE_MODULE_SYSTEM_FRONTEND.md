# Core Module System – Frontend Implementation Guide

## Overview

This document details the design and implementation of the Core Module System for the InteroSight frontend. It covers the conceptual structure, UI rendering, state management, data flow, component architecture, extensibility, and example user flows.

---

## 1. Conceptual Structure

### Modules & Submodules
- **Module:** A top-level section (e.g., Introduction, Identity, Your Journey)
- **Submodule:** A focused journaling entry or activity within a module
- **Each submodule** contains:
  - Title & description
  - Reflective journaling prompt(s)
  - Input fields (text, possibly image, etc.)
  - Progress tracking

**Example Structure:**
```json
{
  "modules": [
    {
      "id": "introduction",
      "title": "Introduction",
      "submodules": [
        {
          "id": "privacy",
          "title": "Data Privacy",
          "prompt": "How do you feel about sharing your data?",
          "type": "text"
        },
        // ...more submodules
      ]
    },
    // ...more modules
  ]
}
```

---

## 2. UI Rendering & Navigation

- **Module List Screen:** Shows all available modules (with progress indicators)
- **Module Detail Screen:** Shows submodules within a module
- **Submodule Screen:** Presents journaling prompt, input fields, and navigation (next/prev)
- **Progress Bar:** Indicates completion within modules/submodules
- **Navigation:**
  - Linear (next/prev)
  - Jump to incomplete submodules

---

## 3. State Management

- **User Progress:**
  - Track completed submodules per user
  - Store responses (text, images, timestamps)
- **Technologies:**
  - React Context for global state
  - Local state for form inputs
  - Sync with backend (Firebase/Firestore)
- **Persistence:**
  - Save progress locally (for offline)
  - Sync to backend on reconnect

---

## 4. Data Flow

1. **User selects a module** → Loads submodules
2. **User completes a submodule** → Input captured in local state
3. **On submit:**
   - Validate input
   - Save to backend (Firestore)
   - Update progress state
4. **Progress indicators** update in UI
5. **User can revisit/edit previous entries**

---

## 5. Component Structure & File Organization

```
/src
  /components
    ModuleList.tsx         # List of modules
    ModuleDetail.tsx       # Submodules in a module
    SubmoduleEntry.tsx     # Journaling prompt/input
    ProgressBar.tsx        # Progress indicator
    Navigation.tsx         # Next/Prev controls
  /contexts
    ModuleContext.tsx      # State management
  /api
    firestore.ts           # Backend sync helpers
  /types
    module.ts              # TypeScript types/interfaces
```

---

## 6. Extensibility

- **Adding Modules/Submodules:**
  - Define new modules/submodules in a config file or backend
  - Components render dynamically based on config/schema
- **Custom Input Types:**
  - Support for text, image, multiple choice, etc.
  - Render input fields based on submodule type
- **Dynamic Assignment:**
  - Modules can be conditionally shown based on user progress or backend logic

---

## 7. Example UI/UX Flows

### a) First-Time User
1. Sees onboarding and privacy info (Module 1)
2. Completes demographic submodule
3. Answers first journaling prompt
4. Progress bar updates
5. Can navigate to next submodule or revisit previous

### b) Returning User
1. Sees dashboard with module progress
2. Can continue where left off or review/edit past entries

---

## 8. Wireframe Suggestions

- **Module List:**
  - Card/grid layout, each card shows module title, description, and progress
- **Submodule Entry:**
  - Prompt at top, input field(s) below, progress bar, navigation buttons
- **Progress Bar:**
  - Horizontal bar or stepper at top of module/submodule screens

---

## 9. Future Considerations

- **Accessibility:** Ensure all components are accessible (WCAG compliance)
- **Mobile Responsiveness:** Design for mobile-first experience
- **Theming:** Support for dark/light mode

---

## 10. Interactive Journaling UI/UX (Journey-Based)

### Home Screen: Journey Visualization
- **Modules are displayed as a journey path** (inspired by step/nodes visualization):
  - Each module is a node (circle or icon) on a horizontal or vertical path.
  - Connecting lines show progression; completed modules are filled, current is highlighted, locked/future are dimmed.
  - Progress is visually intuitive, similar to a learning path.
- **Clicking a module** opens its detail view, showing submodules.

### Module Screen: Submodule List
- **Submodules are listed vertically** within the selected module.
  - Each submodule has a title, short description, and a progress bar (showing completion/semantic richness).
  - Completed submodules are visually distinct (e.g., checkmark, filled bar).
- **Clicking a submodule** opens the journaling entry card for that submodule.

### Submodule: Journaling Entry Card & LLM Reprompting
- **Journaling Card Layout:**
  - Prompt at the top (large, clear, with soft highlight)
  - User response input area (auto-expanding text box)
  - Action buttons at the bottom:
    - **Submit:** Sends user input to LLM, which generates a deeper follow-up prompt (reprompt). The new prompt appears at the top, and the user can continue responding.
    - **Pause:** Exits to module screen, saving progress (submodule not complete).
    - **End:** Only enabled if semantic richness threshold is met. Marks submodule as 100% complete, returns to module screen.
  - Progress bar at the top, fills as semantic richness increases (based on LLM or backend analysis).

- **LLM Reprompting Loop:**
  - On submit, the LLM receives the original prompt and all user responses so far, and generates a new, deeper prompt.
  - The user can continue this loop, delving deeper with each reprompt.
  - The session can be paused at any time, or ended if the richness threshold is reached.

### Progress Tracking & Visualization
- **Modules:**
  - Journey path shows overall progress through modules.
  - Completed modules are filled, current is highlighted.
- **Submodules:**
  - Each submodule has a progress bar (semantic richness).
  - Only marked 100% complete if session is ended after sufficient engagement.
  - Paused submodules retain partial progress.

### User Flow (Textual Wireframe)

```
[ Home Screen: Journey Path ]
  (O)---(O)---(O)---(O)
  [Intro] [Identity] [Journey] [Daily Impact]
      |         |         |         |
      v         v         v         v

[ On Module Click: Module Screen ]
  Module: Identity
  --------------------------
  | Submodule 1 | [progress bar]
  | Submodule 2 | [progress bar]
  | Submodule 3 | [progress bar]

[ On Submodule Click: Journaling Card ]
  +--------------------------------------+
  | Prompt: "What roles do you play..."  |
  | [Progress Bar: 40%]                  |
  | [User Text Input]                    |
  |                                      |
  | [Submit] [Pause] [End (disabled)]    |
  +--------------------------------------+

  // After submit, LLM reprompt appears:
  | Prompt: "You mentioned 'daughter'—can you share more about how this role shapes your daily life?" |
  | [Progress Bar: 70%]                  |
  | [User Text Input]                    |
  | [Submit] [Pause] [End (enabled)]     |

[ On End: ]
  - Submodule progress bar fills to 100%, submodule marked complete.
  - User returns to module screen.

[ On Pause: ]
  - Progress saved, user returns to module screen, submodule shows partial progress.
```

### Visual & Interaction Details
- Journey path uses soft colors, rounded nodes, and subtle animations for progress.
- Submodule progress bars fill smoothly as user engages.
- Journaling card transitions are quick and tactile.
- Action buttons are large, clear, and provide feedback on tap/click.
- LLM reprompts appear with a gentle animation, keeping the user focused.

### Accessibility & Mobile
- Journey path and cards are fully responsive.
- All actions accessible via keyboard and screen reader.
- Large tap areas and clear focus states.
- Animations respect reduced motion settings.

---

*This document is a living specification. Update as the frontend implementation evolves.* 