# Changelog

## [Unreleased]

### Added
- **LLM Integration**: Integration with local Ollama models for production use
- **Dynamic Follow-up Questions**: AI-generated contextual prompts based on conversation
- **Enhanced Chat System**: Real AI responses with crisis detection and safety protocols

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