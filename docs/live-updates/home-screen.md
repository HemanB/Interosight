# HomeScreen Documentation

## Overview
The HomeScreen serves as the main dashboard for authenticated users in the Interosight application. It provides an overview of the user's recovery journey and offers quick access to key features including continuing module progression, journaling, and logging functionality.

## Current Implementation Status
**Status:** ✅ FUNCTIONAL - Core HomeScreen implemented with professional styling and working navigation
**Functionality:** 🔄 PARTIAL - Navigation complete, needs Firebase integration for real data persistence
**Navigation:** ✅ COMPLETE - All buttons and navigation elements working
**Data Persistence:** 🔄 PENDING - Real progress tracking and module status needed

## Screen Layout

### Main Container
- **Layout**: `max-w-6xl mx-auto` for centered content
- **Background**: Inherits from parent (olive-50)
- **Spacing**: `mb-8` for header section

### Header Section
- **Title**: "Welcome to Interosight" in `text-3xl font-bold text-gray-800`
- **Subtitle**: "Take one step at a time toward healing and self-understanding" in `text-gray-600`
- **Layout**: Flex container with space between title and progress stats
- **Progress Display**: Shows overall journey completion percentage

### Three Main Action Cards
Grid layout with `grid-cols-1 md:grid-cols-3 gap-6 mb-8`:

#### Start Your Journey Card
- **Icon**: 📚 in `w-16 h-16 bg-primary-100 rounded-full`
- **Title**: "Start Your Journey" in `text-xl font-semibold text-gray-800`
- **Description**: "Begin with guided prompts and structured reflection" in `text-gray-600`
- **Button**: "Get Started" with `btn-primary w-full`
- **Functionality**: ✅ Navigates to Introduction module

#### Freeform Journaling Card
- **Icon**: ✍️ in `w-16 h-16 bg-accent-100 rounded-full`
- **Title**: "Freeform Journaling" in `text-xl font-semibold text-gray-800`
- **Description**: "Write freely about anything on your mind" in `text-gray-600`
- **Button**: "Start Writing" with `btn-primary w-full`
- **Functionality**: ✅ Navigates to FreeformJournalScreen

#### Track Your Day Card
- **Icon**: 📊 in `w-16 h-16 bg-olive-100 rounded-full`
- **Title**: "Track Your Day" in `text-xl font-semibold text-gray-800`
- **Description**: "Log meals, behaviors, and emotions" in `text-gray-600`
- **Button**: "Log Now" with `btn-primary w-full`
- **Functionality**: ✅ Navigates to LogScreen

### Modules Section
Card container with `card mb-8`:

#### Section Header
- **Title**: "Your Recovery Modules" in `text-2xl font-semibold text-gray-800 mb-6`
- **Progress Counter**: Shows "X of Y completed" for overall progress

#### Module Grid
`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`:

##### Module Cards
Each module displays:
- **Title**: Module name in `text-lg font-semibold text-gray-800`
- **Description**: Module description in `text-sm text-gray-600`
- **Dynamic Badge**: Purple badge for dynamic modules
- **Progress Bar**: 
  - Background: `bg-olive-200 rounded-full h-2`
  - Progress: `bg-primary-500 h-2 rounded-full` (shows actual progress)
  - Counter: "X/Y" in `text-xs text-primary-600 font-medium`
- **Status Icon**: 
  - Current: ○ with `text-primary-600 animate-pulse`
  - Locked: 🔒 with `text-gray-400`
- **Action Button**: 
  - Current: "Start Module" (functional)
  - Locked: "Locked" (disabled)
  - Styling: `bg-primary-600 text-white hover:bg-primary-700` for current

## Module Data Structure

### Available Modules
1. **Introduction** (current)
   - Description: "Setting the stage for recovery"
   - Status: current
   - Progress: 0/4 submodules
   - Type: base

2. **Identity** (locked)
   - Description: "Who you are beyond the eating disorder"
   - Status: locked
   - Progress: 0/4 submodules
   - Type: base

3. **Your Journey** (locked)
   - Description: "What brought you here and past recovery attempts"
   - Status: locked
   - Progress: 0/4 submodules
   - Type: base

4. **Daily Impact** (locked)
   - Description: "How ED affects your daily life"
   - Status: locked
   - Progress: 0/4 submodules
   - Type: dynamic

5. **Interpersonal Impact** (locked)
   - Description: "Impact on relationships and connection"
   - Status: locked
   - Progress: 0/4 submodules
   - Type: dynamic

6. **Emotional Landscape** (locked)
   - Description: "Emotional cognition and interpretation"
   - Status: locked
   - Progress: 0/4 submodules
   - Type: dynamic

## State Management

### Local State
- **Navigation Handlers**: Functional navigation to all screens
- **Progress Calculation**: Real-time progress percentage calculation
- **Module Status**: Dynamic status based on user progress

### Context Dependencies
- **useAuth Hook**: Provides user profile data
- **setCurrentScreen**: Navigation function passed from App.tsx


## Dependencies

### External Dependencies
- **React**: Component framework
- **Tailwind CSS**: Styling classes
- **useAuth**: Authentication context

### Internal Dependencies
- **Navigation System**: Functional screen navigation
- **Module System**: Module progress tracking
- **User Data**: User profile integration

## Interactions with Other Screens

### Navigation Flow
1. **Entry Point**: First screen after authentication
2. **Functional Destinations**:
   - ✅ ModuleScreen (Introduction module)
   - ✅ FreeformJournalScreen
   - ✅ LogScreen
   - ✅ HistoryScreen (via sidebar)
   - ✅ SettingsScreen (via sidebar)

### Data Flow
- **User Progress**: Displays real module completion data
- **Progress Calculation**: Real-time percentage calculation
- **Navigation State**: Proper screen state management

## Visual Design

### Color Scheme
- **Primary**: Olive green theme (`olive-600`, `olive-100`)
- **Accent**: Primary colors for highlights (`primary-500`, `primary-100`)
- **Text**: Gray scale for readability (`gray-800`, `gray-600`)
- **Background**: Light olive (`olive-50`)

### Typography
- **Headers**: Bold weights for hierarchy
- **Body Text**: Regular weights for readability
- **Sizes**: Responsive text sizing

### Layout
- **Responsive**: Mobile-first design with breakpoints
- **Grid System**: CSS Grid for card layouts
- **Spacing**: Consistent margin and padding

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: ✅ Logical flow through interactive elements
- **Focus States**: ✅ Visible focus indicators

### Screen Reader Support
- **Semantic HTML**: ✅ Proper heading structure
- **Alt Text**: ✅ Icons have proper accessibility
- **ARIA Labels**: ✅ Interactive elements properly labeled

### Visual Design
- **Color Contrast**: ✅ Meets accessibility standards
- **Text Size**: ✅ Readable font sizes
- **Spacing**: ✅ Adequate touch targets

## Performance Considerations

### Bundle Size
- **Minimal Dependencies**: Only essential UI components
- **Static Content**: No heavy computations

### Loading States
- **Skeleton Loading**: Could be implemented for dynamic content
- **Progressive Enhancement**: Basic layout loads first

## Current Implementation Status

### Mostly Functional
1. **Navigation System**: Mostly complete screen navigation
2. **Action Cards**: All three cards functional
3. **Module System**: Current modules clickable
4. **Progress Tracking**: Real progress calculation

### 🔄 NEXT PHASE - Backend Integration
1. **Firebase Connection**: Connect to real user data and progress
2. **Module Progress**: Implement real progress persistence and completion tracking
3. **User Data**: Display real user statistics and activity from journaling/logging
4. **Data Persistence**: Save user progress, journal entries, and module completion
5. **Real-time Updates**: Live progress updates and module status changes

## Future Enhancements

### Functional Features
- **Real Data**: Connect to Firebase for persistent data and progress tracking
- **Progress Persistence**: Save module completion status and submodule progress
- **User Statistics**: Real engagement metrics from journaling and logging activity
- **Recent Activity**: Show recent journal entries and logs with timestamps
- **Module Unlocking**: Dynamic module assignment based on completion progress

### UI Improvements
- **Interactive Cards**: Enhanced hover effects and animations
- **Progress Animations**: Animated progress bars
- **Loading States**: Skeleton screens for data loading
- **Empty States**: Better messaging for new users

### Data Integration
- **Firebase Integration**: Real user data and progress
- **Module System**: Complete module functionality with persistence
- **Analytics**: User engagement tracking
- **Personalization**: User-specific content and recommendations

## Security Considerations

### Data Protection
- **User Privacy**: No sensitive data displayed
- **Authentication**: Requires authenticated user
- **Authorization**: Role-based access control


## Error Handling

### Current State
- **Navigation Errors**: ✅ Proper error handling for invalid navigation
- **Graceful Degradation**: ✅ Disabled state for locked modules
- **User Feedback**: ✅ Clear navigation feedback

### Future Implementation
- **Network Errors**: Handle data loading failures
- **Validation Errors**: Handle invalid navigation attempts
- **User Feedback**: Clear error messages and recovery options

## Technical Implementation Details

### Navigation Handlers
```typescript
const handleContinueJourney = () => {
  const currentModule = modules.find(m => m.status === 'current');
  if (currentModule && setCurrentScreen) {
    setCurrentScreen({ screen: 'module', moduleId: currentModule.id });
  }
};
```

### Progress Calculation
```typescript
const progressPercentage = ((completedModules + (currentModule ? 0.5 : 0)) / totalModules) * 100;
```

### Module Status Management
- **Current**: Only Introduction module is current
- **Locked**: All other modules are locked
- **Dynamic**: Daily Impact, Interpersonal Impact, Emotional Landscape are dynamic modules

---