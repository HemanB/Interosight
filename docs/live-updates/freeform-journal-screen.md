# FreeformJournalScreen Documentation

## Overview
The FreeformJournalScreen provides unstructured journaling capabilities for users to write freely about anything on their mind. It features a large text area with real-time word counting, save functionality, and the ability to view and edit previous entries. This screen serves as a safe space for users to express themselves without structured prompts or requirements.

## Current Implementation Status
**Status:** ✅ FUNCTIONAL - Core journaling interface implemented
**Functionality:** 🔄 PARTIAL - UI complete, needs Firebase integration
**Data Persistence:** 🔄 PENDING - Save functionality placeholder

## Screen Layout

### Main Container
- **Layout**: `max-w-4xl mx-auto p-6` for centered content
- **Background**: Inherits from parent (olive-50)
- **Spacing**: Proper spacing between sections

### Header Section
- **Title**: "Freeform Journaling" in `text-3xl font-bold text-gray-800 mb-2`
- **Subtitle**: "Write freely about anything on your mind" in `text-gray-600`
- **Back Button**: "← Back to Home" with navigation functionality

### Journaling Interface
- **Text Area**: Large, auto-expanding text input
- **Word Counter**: Real-time word count display
- **Save Button**: Save entry functionality
- **Entry History**: View and edit previous entries

## Core Functionality

### Text Input System
- **Large Text Area**: Auto-expanding textarea for comfortable writing
- **Placeholder Text**: "Start writing about anything on your mind..."
- **Auto-resize**: Textarea grows with content
- **Focus Management**: Automatic focus on textarea when screen loads

### Word Counting
- **Real-time Counter**: Live word count as user types
- **Display Location**: Below textarea with clear styling
- **Format**: "X words" with appropriate styling
- **Minimum Threshold**: Highlight when below minimum (optional)

### Save Functionality
- **Save Button**: "Save Entry" with proper styling
- **Loading State**: Show loading during save operation
- **Success Feedback**: Clear confirmation of successful save
- **Error Handling**: Display errors if save fails

### Entry History
- **Recent Entries**: Display last 5-10 entries
- **Entry Cards**: Each entry in a card format
- **Edit Capability**: Click to edit previous entries
- **Delete Capability**: Option to delete entries
- **Timestamp**: Show when each entry was created

## Data Models

### Journal Entry Interface
```typescript
interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  tags?: string[];
  isEdited: boolean;
  editHistory?: {
    timestamp: Date;
    previousContent: string;
  }[];
}
```

### Entry Display Interface
```typescript
interface EntryDisplay {
  id: string;
  content: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  preview: string; // First 100 characters
}
```

## State Management

### Local State Variables
- `content`: string - Current textarea content
- `wordCount`: number - Real-time word count
- `isSaving`: boolean - Save operation loading state
- `entries`: JournalEntry[] - User's journal entries
- `editingEntry`: string | null - ID of entry being edited
- `error`: string | null - Error message display

### Context Integration
- **useAuth Hook**: Provides user authentication and profile data
- **JournalContext**: Would provide journal data management (when implemented)

## CRUD Operations

### Create (Save New Entry)
```typescript
const saveEntry = async (content: string) => {
  try {
    setIsSaving(true);
    
    const entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: user.id,
      content,
      wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
      sentiment: await analyzeSentiment(content), // Optional AI analysis
      tags: extractTags(content), // Optional tag extraction
      isEdited: false,
      editHistory: []
    };
    
    const savedEntry = await saveJournalEntryToFirestore(entry);
    setEntries(prev => [savedEntry, ...prev]);
    setContent('');
    setError(null);
    
  } catch (error) {
    setError('Failed to save entry. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
```

### Read (Load Entries)
```typescript
const loadEntries = async () => {
  try {
    const userEntries = await getJournalEntriesFromFirestore(user.id);
    setEntries(userEntries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  } catch (error) {
    setError('Failed to load entries. Please refresh the page.');
  }
};
```

### Update (Edit Entry)
```typescript
const editEntry = async (entryId: string, newContent: string) => {
  try {
    setIsSaving(true);
    
    const entry = entries.find(e => e.id === entryId);
    if (!entry) throw new Error('Entry not found');
    
    const updatedEntry: JournalEntry = {
      ...entry,
      content: newContent,
      wordCount: newContent.split(/\s+/).filter(word => word.length > 0).length,
      updatedAt: new Date(),
      isEdited: true,
      editHistory: [
        ...entry.editHistory || [],
        {
          timestamp: new Date(),
          previousContent: entry.content
        }
      ]
    };
    
    await updateJournalEntryInFirestore(entryId, updatedEntry);
    setEntries(prev => prev.map(e => e.id === entryId ? updatedEntry : e));
    setEditingEntry(null);
    setError(null);
    
  } catch (error) {
    setError('Failed to update entry. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
```

### Delete (Remove Entry)
```typescript
const deleteEntry = async (entryId: string) => {
  try {
    await deleteJournalEntryFromFirestore(entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
    setError(null);
  } catch (error) {
    setError('Failed to delete entry. Please try again.');
  }
};
```

## Firebase Integration

### Firestore Collections
```typescript
// Collection: journal_entries
interface FirestoreJournalEntry {
  userId: string;
  content: string;
  wordCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sentiment?: string;
  tags?: string[];
  isEdited: boolean;
  editHistory?: {
    timestamp: Timestamp;
    previousContent: string;
  }[];
}
```

### Security Rules
```javascript
// Firestore security rules for journal entries
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /journal_entries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## User Experience Features

### Auto-save Functionality
- **Draft Saving**: Auto-save every 30 seconds while typing
- **Recovery**: Restore draft content if user navigates away
- **Visual Indicator**: Show "Draft saved" message
- **Conflict Resolution**: Handle multiple drafts gracefully

### Writing Assistance
- **Word Count Goals**: Optional minimum word count targets
- **Writing Timer**: Optional timer for focused writing sessions
- **Distraction-free Mode**: Full-screen writing mode
- **Spell Check**: Basic spell check integration

### Entry Organization
- **Search Functionality**: Search through previous entries
- **Tag System**: Auto-extract or manual tagging
- **Date Filtering**: Filter entries by date range
- **Export Options**: Export entries as text or PDF

## Performance Considerations

### Data Loading
- **Pagination**: Load entries in batches of 20
- **Lazy Loading**: Load more entries on scroll
- **Caching**: Cache frequently accessed entries
- **Offline Support**: Store entries locally when offline

### Text Processing
- **Debounced Word Count**: Update word count every 500ms
- **Efficient Rendering**: Virtual scrolling for large entry lists
- **Memory Management**: Clean up large text content
- **Optimized Updates**: Only re-render changed components

## Error Handling

### Network Errors
- **Retry Logic**: Automatic retry for failed saves
- **Offline Queue**: Queue saves when offline
- **User Feedback**: Clear error messages and recovery options
- **Graceful Degradation**: Continue working with cached data

### Validation Errors
- **Content Validation**: Ensure content meets requirements
- **Length Limits**: Prevent extremely long entries
- **Character Encoding**: Handle special characters properly
- **Malicious Content**: Sanitize user input

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Keyboard Shortcuts**: Ctrl+S to save, Ctrl+Z to undo
- **Focus Management**: Proper focus indicators
- **Screen Reader**: Clear content descriptions

### Visual Accessibility
- **High Contrast**: Ensure sufficient color contrast
- **Font Size**: Adjustable text size
- **Line Spacing**: Adequate line spacing for readability
- **Color Blindness**: Don't rely solely on color for information

## Future Enhancements

### AI Integration
- **Sentiment Analysis**: Analyze emotional content
- **Writing Prompts**: AI-generated writing suggestions
- **Content Summarization**: Auto-summarize long entries
- **Pattern Recognition**: Identify writing patterns over time

### Advanced Features
- **Voice Input**: Speech-to-text functionality
- **Rich Text**: Basic formatting options
- **Image Attachments**: Add images to entries
- **Collaborative Writing**: Share entries with trusted contacts

### Analytics Integration
- **Writing Analytics**: Track writing patterns and habits
- **Progress Tracking**: Monitor journaling consistency
- **Insight Generation**: AI-powered writing insights
- **Goal Setting**: Set and track writing goals

## Security Considerations

### Data Privacy
- **End-to-End Encryption**: Encrypt sensitive journal content
- **Access Control**: Ensure only user can access their entries
- **Data Retention**: Clear data retention policies
- **Export Control**: Allow users to export and delete their data

### Content Moderation
- **Harmful Content**: Detect and flag concerning content
- **Crisis Detection**: Identify crisis indicators
- **Professional Support**: Provide resources for users in crisis
- **Privacy Protection**: Never share content without consent

---

*This documentation provides comprehensive requirements for implementing the FreeformJournalScreen with full CRUD functionality and data persistence.* 