# LogScreen Documentation

## Overview
The LogScreen provides comprehensive meal and behavior logging functionality with detailed emotional and contextual tracking. It allows users to log both meals and compensatory behaviors with extensive metadata including emotions, satiety, social context, and location information.

## Current Implementation Status
**Status:** ✅ UI Complete - All form components and interactions implemented
**Functionality:** 🔄 Wireframe - UI ready, needs backend integration
**Form Validation:** 🔄 Basic - Form structure complete, needs validation logic

## Screen Layout

### Main Container
- **Layout**: Responsive container with proper spacing
- **Background**: Inherits from parent theme
- **Navigation**: Tab-based switching between meal and behavior logging

### Tab Navigation
- **Meal Logging Tab**: Primary interface for food intake tracking
- **Behavior Logging Tab**: Interface for compensatory behavior tracking
- **Toggle Functionality**: Smooth transitions between logging types

## Meal Logging Interface

### Form Structure
- **Meal Type Selection**: Dropdown with predefined options
  - Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner, Evening Snack, Late Night
- **Description Field**: Text input for meal details
- **Satiety Tracking**: Pre/post sliders (1-10 scale)
- **Emotion Selection**: Multi-select checkboxes for emotional states
- **Feeling Scale**: Pre/post sliders with emoji indicators
- **Social Context**: Dropdown for social situation
- **Location**: Dropdown for physical location

### Data Collection Fields

#### Meal Information
- **Meal Type**: Required dropdown selection
- **Description**: Text input for meal details
- **Timestamp**: Automatic or manual entry

#### Satiety Tracking
- **Pre-Meal Satiety**: 1-10 scale slider
- **Post-Meal Satiety**: 1-10 scale slider
- **Visual Indicators**: Clear scale representation

#### Emotional State
- **Pre-Meal Emotions**: Multi-select from predefined options
  - Anxious, Calm, Excited, Sad, Happy, Stressed, Relaxed, Guilty
  - Frustrated, Content, Worried, Confident, Overwhelmed, Peaceful
- **Post-Meal Emotions**: Same options as pre-meal
- **Selection Logic**: Toggle functionality for multiple selections

#### Feeling Scale
- **Pre-Meal Feeling**: 1-10 scale with emoji indicators
- **Post-Meal Feeling**: 1-10 scale with emoji indicators
- **Emoji Mapping**: Visual representation of feeling levels

#### Context Information
- **Social Context**: Dropdown selection
  - Alone, With family, With friends, With colleagues, In a room with others, On video call
- **Location**: Dropdown selection
  - Home, Work, School, Restaurant, Cafeteria, Bedroom, Kitchen, Car, Other

## Behavior Logging Interface

### Form Structure
- **Trigger Description**: Text input for what triggered the behavior
- **Behavior Description**: Text input for the behavior itself
- **Reflection**: Text input for post-behavior thoughts
- **Emotion Tracking**: Pre/post emotional state selection
- **Feeling Scale**: Pre/post feeling assessment
- **Context Information**: Social and location context

### Data Collection Fields

#### Behavior Information
- **Trigger**: Text input for what led to the behavior
- **Behavior**: Text input describing the behavior
- **Reflection**: Text input for post-behavior analysis

#### Emotional State
- **Pre-Behavior Emotions**: Multi-select from same options as meal logging
- **Post-Behavior Emotions**: Multi-select from same options
- **Selection Logic**: Toggle functionality for multiple selections

#### Feeling Scale
- **Pre-Behavior Feeling**: 1-10 scale with emoji indicators
- **Post-Behavior Feeling**: 1-10 scale with emoji indicators

#### Context Information
- **Social Context**: Same dropdown options as meal logging
- **Location**: Same dropdown options as meal logging

## Retrospective Logging

### Time Selection
- **Recent Option**: Log entry from 15 minutes ago
- **Custom Time**: Manual date/time selection
- **Current Time**: Default for immediate logging

### Implementation
- **Toggle Switch**: Enable/disable retrospective mode
- **Time Input**: Custom datetime picker when enabled
- **Validation**: Ensure custom time is not in the future

## Form Validation

### Current State
- **Basic Validation**: Required field checking
- **UI Feedback**: Visual indicators for form state
- **Error Handling**: Basic error display

### Required Fields
- **Meal Logging**: Meal type, description
- **Behavior Logging**: Trigger, behavior, reflection
- **Optional Fields**: All emotional and contextual data

## State Management

### Local State
- **Form Data**: All input values stored in component state
- **UI State**: Tab selection, loading states, error states
- **Validation State**: Form validation status

### Data Flow
```
User Input → Form Validation → State Update → UI Update
```

## Visual Design

### Color Scheme
- **Primary**: Olive green theme consistent with app
- **Accent**: Blue for interactive elements
- **Error**: Red for validation errors
- **Success**: Green for successful submissions

### Typography
- **Headers**: Clear hierarchy with bold weights
- **Body Text**: Readable font sizes and spacing
- **Labels**: Consistent labeling for all form fields

### Layout
- **Responsive**: Mobile-first design with breakpoints
- **Grid System**: CSS Grid for form layout
- **Spacing**: Consistent margin and padding

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical flow through form fields
- **Focus States**: Visible focus indicators
- **Keyboard Shortcuts**: Enter to submit, Escape to cancel

### Screen Reader Support
- **Semantic HTML**: Proper form structure
- **Labels**: Associated labels for all inputs
- **ARIA Attributes**: Proper accessibility attributes

### Visual Design
- **Color Contrast**: Meets accessibility standards
- **Text Size**: Readable font sizes
- **Touch Targets**: Adequate size for mobile interaction

## Performance Considerations

### Form Performance
- **State Updates**: Efficient state management
- **Validation**: Real-time validation without performance impact
- **Rendering**: Optimized re-renders

### Data Handling
- **Input Processing**: Efficient form data processing
- **Validation**: Fast validation algorithms
- **Submission**: Optimized data submission

## Next Steps for Implementation

### Phase 2: Backend Integration
1. **Firebase Connection**: Connect form submission to Firestore
2. **Data Persistence**: Implement real data storage
3. **Form Validation**: Add comprehensive validation logic
4. **Error Handling**: Implement proper error handling

### Phase 3: Feature Enhancement
1. **Image Upload**: Add photo upload capability
2. **Search/Filter**: Implement entry search and filtering
3. **Analytics**: Connect to analytics system
4. **Notifications**: Add reminder and notification system

## Error Handling

### Current State
- **Basic Validation**: Required field checking
- **Error Display**: Simple error messages
- **Form Reset**: Basic form reset functionality

### Future Implementation
- **Network Errors**: Handle API failures gracefully
- **Validation Errors**: Comprehensive field validation
- **User Feedback**: Clear error messages and recovery options
- **Data Recovery**: Save draft functionality

## Security Considerations

### Data Protection
- **Input Sanitization**: Clean user input
- **Privacy**: Secure handling of sensitive data
- **Authentication**: Ensure user authentication

### Form Security
- **CSRF Protection**: Prevent cross-site request forgery
- **Input Validation**: Server-side validation
- **Data Encryption**: Encrypt sensitive data

## Future Enhancements

### Functional Features
- **Image Upload**: Photo attachment capability
- **Voice Input**: Voice-to-text functionality
- **Auto-save**: Automatic draft saving
- **Template System**: Predefined entry templates

### UI Improvements
- **Progress Indicators**: Visual progress tracking
- **Animations**: Smooth transitions and micro-interactions
- **Themes**: User-selectable themes
- **Customization**: User-customizable form fields

### Analytics Integration
- **Pattern Recognition**: Identify behavioral patterns
- **Trend Analysis**: Track changes over time
- **Insight Generation**: AI-powered insights
- **Progress Tracking**: Visual progress indicators 