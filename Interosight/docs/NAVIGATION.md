# Documentation Navigation

This document serves as a guide to navigate Interosight's documentation, mapping documentation files to specific implementations and tasks.

## Core Documentation

### System Architecture
📄 `docs/core/ARCHITECTURE.md`
- Overall system design and patterns
- Technology stack decisions
- State management approach
- Security model
- Error handling
- Performance considerations

**Relevant for:**
- Initial project setup
- Architecture decisions
- Technology choices
- System-wide changes

### Data Flow
📄 `docs/core/DATA_FLOW.md`
- Data flow patterns
- State management
- API integration
- Event handling

**Relevant for:**
- State management implementation
- API integration
- Data synchronization
- Event handling

### Tech Stack
📄 `docs/core/TECH_STACK.md`
- Frontend technologies
- Backend services
- Development tools
- Testing framework

**Relevant for:**
- Development environment setup
- Dependency management
- Tool configuration
- Testing setup

## Database Documentation

### Structure
📄 `docs/database/STRUCTURE.md`
- Overall database architecture
- Collection organization
- Security rules
- Access patterns

**Relevant for:**
- Database setup
- Security implementation
- Query optimization
- Data modeling

### Module Schema
📄 `docs/database/schemas/MODULE.md`
- Module system data models
- Progress tracking
- Entry chains
- Module progression

**Relevant for:**
- Module system implementation
- Progress tracking features
- Module navigation
- Content management

### Journal Schema
📄 `docs/database/schemas/JOURNAL.md`
- Journal entry models
- AI integration
- Entry chains
- Edit history

**Relevant for:**
- Journaling features
- AI prompt integration
- Entry management
- History tracking

### Activity Schema
📄 `docs/database/schemas/ACTIVITY.md`
- Activity tracking models
- Behavior logging
- Pattern recognition
- Insight generation

**Relevant for:**
- Activity logging features
- Pattern analysis
- Insight generation
- Progress visualization

## Implementation Guides

### Setup Guide
📄 `docs/implementation/SETUP.md`
- Development environment
- Dependencies
- Configuration
- Local testing

**Relevant for:**
- Initial setup
- Development environment
- Testing setup
- Configuration management

### Deployment Guide
📄 `docs/implementation/DEPLOYMENT.md`
- Build process
- Environment configuration
- Deployment steps
- Monitoring setup

**Relevant for:**
- Build configuration
- Deployment process
- Environment setup
- Monitoring implementation

## Feature Implementation Mapping

### Module System
**Primary Docs:**
- `docs/database/schemas/MODULE.md`
- `docs/core/ARCHITECTURE.md` (State Management section)

**Implementation Files:**
- `src/screens/ModuleScreen.tsx`
- `src/services/moduleService.ts`
- `src/data/modules.ts`

### Journaling System
**Primary Docs:**
- `docs/database/schemas/JOURNAL.md`
- `docs/core/DATA_FLOW.md` (AI Integration section)

**Implementation Files:**
- `src/screens/ModuleScreen.tsx`
- `src/screens/FreeformJournalScreen.tsx`
- `src/services/journalService.ts`
- `src/services/aiService.ts`

### Activity Tracking
**Primary Docs:**
- `docs/database/schemas/ACTIVITY.md`
- `docs/core/DATA_FLOW.md` (Analytics section)

**Implementation Files:**
- `src/screens/LogScreen.tsx`
- `src/services/activityService.ts`
- `src/services/analyticsService.ts`

### User Interface
**Primary Docs:**
- `docs/core/ARCHITECTURE.md` (UI Components section)
- `docs/implementation/SETUP.md` (Styling section)

**Implementation Files:**
- `src/screens/HomeScreen.tsx`
- `src/screens/HistoryScreen.tsx`
- `src/components/*`

## Common Tasks

### Adding a New Module
1. Review `docs/database/schemas/MODULE.md`
2. Update module definitions in `src/data/modules.ts`
3. Update progress tracking in `src/services/moduleService.ts`
4. Update UI in `src/screens/ModuleScreen.tsx`

### Implementing AI Features
1. Review `docs/database/schemas/JOURNAL.md` (AI Integration section)
2. Update AI service in `src/services/aiService.ts`
3. Integrate with journal system in `src/services/journalService.ts`
4. Update UI in relevant screen components

### Adding Activity Tracking
1. Review `docs/database/schemas/ACTIVITY.md`
2. Update tracking in `src/services/activityService.ts`
3. Update analytics in `src/services/analyticsService.ts`
4. Update UI in `src/screens/LogScreen.tsx`

### Database Changes
1. Review `docs/database/STRUCTURE.md`
2. Update schemas in `docs/database/schemas/*`
3. Update security rules
4. Update relevant service implementations

## Best Practices

### Code Organization
- Follow feature-based structure
- Maintain clear separation of concerns
- Use consistent naming conventions
- Keep components focused and reusable

### Documentation Updates
- Keep schema documentation in sync with implementations
- Update navigation document for new features
- Document breaking changes
- Include implementation examples

### Testing
- Write tests for new features
- Update existing tests for changes
- Follow test coverage guidelines
- Document test scenarios 