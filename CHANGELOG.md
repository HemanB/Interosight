# Changelog

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