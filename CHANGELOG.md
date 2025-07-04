# Changelog

## [Unreleased]

### Added
- **LLM Integration**: Integration with local Ollama models for production use
- **Dynamic Follow-up Questions**: AI-generated contextual prompts based on conversation
- **Enhanced Chat System**: Real AI responses with crisis detection and safety protocols

## [v0.5.4] - 2024-07-04

### Added
- **Comprehensive Resources Screen**: Complete resource management system with card-based UI
  - **Emergency Contacts Modal**: Full contact management with call/text/FaceTime functionality
  - **Crisis Hotlines Modal**: Predefined crisis support numbers with one-tap calling
  - **Safety Planning Modal**: Interactive safety plan creation and editing with Firestore integration
  - **Summary View**: Overview screen showing current safety plan before editing

### Technical Features
- **Firestore Integration**: Complete data persistence for safety plans and emergency contacts
- **Modal Architecture**: Reusable modal system for resource management
- **User Authentication**: Proper user association for all saved data
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Proper loading indicators and empty states

### User Experience Improvements
- **Two-View Safety Planning**: Summary view for quick review, edit view for detailed planning
- **Real Communication**: Direct integration with phone/text/FaceTime apps
- **Professional Design**: Clean, clinical-grade UI suitable for healthcare demos
- **Accessibility**: Large touch targets and clear visual hierarchy
- **Responsive Design**: Works seamlessly across web, iOS, and Android

### Resource Categories
- **Emergency & Crisis**: Emergency contacts, crisis hotlines, safety planning
- **Therapeutic Tools**: DBT tools, grounding exercises, coping strategies (placeholders)
- **Professional Support**: Professional resources, support groups (placeholders)
- **Education & Wellness**: Educational resources, self-care tools (placeholders)

### Safety Features
- **Crisis Detection**: Automatic crisis keyword detection in chat
- **Emergency Access**: One-tap access to crisis resources
- **Professional Boundaries**: Clear disclaimers about app limitations
- **Data Privacy**: User-specific data storage with proper authentication

## [v0.5.3] - 2024-07-04

### Added
- **Crisis Hotlines Modal**: Predefined crisis support numbers with call functionality
  - 8 major crisis hotlines including suicide prevention, eating disorders, and mental health
  - One-tap calling with confirmation dialogs
  - Professional appearance with availability information
  - Educational content about what to expect when calling

## [v0.5.1] - 2024-07-04

### Added
- **Emergency Contacts Modal**: Full contact management system
  - Add/remove emergency contacts with edit mode
  - Call, text, and FaceTime functionality for each contact
  - Professional UI with color-coded action buttons
  - Empty state handling and user guidance

## [v0.5.0] - 2024-07-04

### Added
- **Resources Screen**: Complete redesign of crisis tools into comprehensive resources
  - Card-based UI with organized resource categories
  - Professional design suitable for clinical demos
  - Responsive layout with proper spacing and accessibility
  - Clear visual hierarchy and intuitive navigation

### Changed
- **Navigation**: Renamed "Crisis" tab to "Resources" with updated icon
- **Architecture**: Modular modal system for different resource types
- **Design**: Modern card-based interface replacing basic placeholder screen

## [v0.3.0] - 2024-06-26

### Added
- **LLM Integration**: Complete AI-powered chat system with multiple backend support
  - **Ollama Local Models**: Support for local LLM models (llama2, llama3, mistral)
  - **Mock Fallback**: Automatic fallback to safe mock responses if LLM fails
  - **Conversation History**: Maintains context across chat sessions for better responses
  - **Safety Protocols**: Enhanced crisis detection and professional boundaries

### Technical Features
- **Modular LLM Service**: Factory pattern for easy backend switching
- **Environment Configuration**: Automatic configuration based on development/production
- **System Prompts**: Specialized prompts for eating disorder recovery support
- **Error Handling**: Robust error handling with graceful fallbacks
- **Configuration Management**: Easy switching between different models and services

### User Experience Improvements
- **Real AI Responses**: Chat now generates contextual, supportive responses
- **Context Awareness**: AI remembers conversation history for better support
- **Crisis Safety**: Enhanced crisis detection with immediate support resources
- **Professional Boundaries**: Clear disclaimers and safety protocols

### Setup and Configuration
- **Automated Setup Script**: `./setup-ollama.sh` for easy Ollama installation
- **Model Presets**: Pre-configured settings for popular models
- **Test Script**: `test-llm.js` for verifying LLM connectivity
- **Documentation**: Comprehensive setup and configuration guides

## [v0.2.1] - 2024-06-26

### Fixed
- **End Reflection Bug**: Fixed the "End reflection" functionality that was not working properly
  - The "End reflection" prompt now gets added as a message before ending the session
  - Added a confirmation message from the Stone of Wisdom before clearing the session
  - Removed the confusing Alert dialog that was interrupting the flow
  - Added proper timing delays to ensure users can see the messages before session reset
  - Improved user experience with smoother session ending flow

### Technical Changes
- Modified `ChatProvider.tsx` to handle "End reflection" within the normal prompt flow
- Updated `ChatScreen.tsx` to remove redundant Alert dialog
- Added proper message sequencing for session ending
- Improved session reset timing with setTimeout delays

### User Experience Improvements
- Users now see their "End reflection" selection in the chat
- Confirmation message provides closure before session reset
- Smoother transition between sessions
- No more confusing popup dialogs interrupting the flow

## [v0.2.0] - Previous Version

### Features
- Initial chat interface with prompt-driven flow
- Mock chat service implementation
- Crisis detection and resources
- Basic session management 