# ModuleScreen Documentation

## Overview
The ModuleScreen provides structured journaling experiences through a series of modules and submodules. Each module contains 4 submodules with specific journaling prompts designed to guide users through their recovery journey. The screen features progress tracking, word count requirements, and LLM-powered follow-up prompts for deeper reflection.

## Current Implementation Status
**Status:** ✅ FUNCTIONAL - Core module system implemented
**Functionality:** 🔄 PARTIAL - UI complete, needs Firebase integration
**Progress Tracking:** 🔄 PENDING - Real progress persistence needed

## Screen Layout

### Main Container
- **Layout**: `max-w-4xl mx-auto p-6` for centered content
- **Background**: Inherits from parent (olive-50)
- **Spacing**: Proper spacing between sections

### Header Section
- **Module Title**: Dynamic based on current module
- **Module Description**: Context for the current module
- **Back Button**: "← Back to Home" with navigation
- **Progress Bar**: Visual progress indicator for current module

### Submodule Navigation
- **Horizontal Tabs**: 4 submodule tabs with progress indicators
- **Active Tab**: Highlighted current submodule
- **Completion Status**: Visual indicators for completed submodules
- **Navigation**: Click to switch between submodules

### Journaling Interface
- **Prompt Display**: Large, prominent prompt text
- **Text Area**: Auto-expanding textarea for responses
- **Word Counter**: Real-time word count with requirements
- **Navigation Buttons**: Previous/Continue buttons
- **Save Functionality**: Auto-save and manual save options

## Module System

### Available Modules
1. **Introduction** (Base Module)
   - Submodules: 4
   - Status: Current (first module)
   - Description: "Setting the stage for recovery"
   - Prompts: Identity exploration, recovery goals, privacy understanding

2. **Identity** (Base Module)
   - Submodules: 4
   - Status: Locked (requires Introduction completion)
   - Description: "Who you are beyond the eating disorder"
   - Prompts: Self-discovery, values exploration, authentic self

3. **Your Journey** (Base Module)
   - Submodules: 4
   - Status: Locked (requires Identity completion)
   - Description: "What brought you here and past recovery attempts"
   - Prompts: Recovery history, motivation, past experiences

4. **Daily Impact** (Dynamic Module)
   - Submodules: 4
   - Status: Locked (assigned based on progress)
   - Description: "How ED affects your daily life"
   - Prompts: Daily challenges, life impact, avoidance patterns

5. **Interpersonal Impact** (Dynamic Module)
   - Submodules: 4
   - Status: Locked (assigned based on progress)
   - Description: "Impact on relationships and connection"
   - Prompts: Relationship dynamics, social impact, support systems

6. **Emotional Landscape** (Dynamic Module)
   - Submodules: 4
   - Status: Locked (assigned based on progress)
   - Description: "Emotional cognition and interpretation"
   - Prompts: Emotional awareness, coping strategies, inner voice

## Data Models

### Module Interface
```typescript
interface Module {
  id: string;
  title: string;
  description: string;
  type: 'base' | 'dynamic';
  status: 'completed' | 'current' | 'locked';
  submodules: Submodule[];
  completedSubmodules: number;
  totalSubmodules: number;
  unlockedAt?: Date;
  completedAt?: Date;
}
```

### Submodule Interface
```typescript
interface Submodule {
  id: string;
  moduleId: string;
  title: string;
  prompt: string;
  followUpPrompts?: string[];
  wordCountRequirement: {
    minimum: number;
    recommended: number;
  };
  status: 'not_started' | 'in_progress' | 'completed';
  journalEntry?: JournalEntry;
  completedAt?: Date;
  llmInsights?: string[];
}
```

### Module Progress Interface
```typescript
interface ModuleProgress {
  userId: string;
  moduleId: string;
  submoduleProgress: {
    [submoduleId: string]: {
      status: 'not_started' | 'in_progress' | 'completed';
      journalEntryId?: string;
      completedAt?: Date;
      wordCount?: number;
    };
  };
  overallProgress: number; // 0-100
  lastAccessed: Date;
  unlockedAt: Date;
  completedAt?: Date;
}
```

## State Management

### Local State Variables
- `currentModule`: Module - Currently active module
- `currentSubmodule`: Submodule - Currently active submodule
- `submoduleIndex`: number - Index of current submodule (0-3)
- `journalContent`: string - Current journal entry content
- `wordCount`: number - Real-time word count
- `isSaving`: boolean - Save operation loading state
- `moduleProgress`: ModuleProgress - User's progress in current module
- `error`: string | null - Error message display

### Context Integration
- **useAuth Hook**: Provides user authentication and profile data
- **ModuleContext**: Would provide module data management (when implemented)

## CRUD Operations

### Create (Start New Submodule Entry)
```typescript
const startSubmoduleEntry = async (submoduleId: string, initialContent: string) => {
  try {
    setIsSaving(true);
    
    const entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: user.id,
      content: initialContent,
      wordCount: initialContent.split(/\s+/).filter(word => word.length > 0).length,
      moduleId: currentModule.id,
      submoduleId: submoduleId,
      entryType: 'module_journal',
      sentiment: await analyzeSentiment(initialContent),
      tags: extractModuleTags(currentModule.id, submoduleId),
      isEdited: false,
      editHistory: []
    };
    
    const savedEntry = await saveJournalEntryToFirestore(entry);
    
    // Update module progress
    await updateModuleProgress(user.id, currentModule.id, submoduleId, {
      status: 'in_progress',
      journalEntryId: savedEntry.id,
      wordCount: savedEntry.wordCount
    });
    
    setError(null);
    
  } catch (error) {
    setError('Failed to start entry. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
```

### Read (Load Module Progress)
```typescript
const loadModuleProgress = async (moduleId: string) => {
  try {
    const progress = await getModuleProgressFromFirestore(user.id, moduleId);
    setModuleProgress(progress);
    
    // Load current submodule entry if in progress
    if (progress.submoduleProgress[currentSubmodule.id]?.journalEntryId) {
      const entry = await getJournalEntryFromFirestore(
        progress.submoduleProgress[currentSubmodule.id].journalEntryId!
      );
      setJournalContent(entry.content);
      setWordCount(entry.wordCount);
    }
    
  } catch (error) {
    setError('Failed to load module progress. Please refresh the page.');
  }
};
```

### Update (Save Submodule Entry)
```typescript
const saveSubmoduleEntry = async (content: string) => {
  try {
    setIsSaving(true);
    
    const entryId = moduleProgress.submoduleProgress[currentSubmodule.id]?.journalEntryId;
    
    if (entryId) {
      // Update existing entry
      const updatedEntry: JournalEntry = {
        ...existingEntry,
        content,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
        updatedAt: new Date(),
        isEdited: true,
        editHistory: [
          ...existingEntry.editHistory || [],
          {
            timestamp: new Date(),
            previousContent: existingEntry.content
          }
        ]
      };
      
      await updateJournalEntryInFirestore(entryId, updatedEntry);
      
      // Check if submodule is complete
      const isComplete = updatedEntry.wordCount >= currentSubmodule.wordCountRequirement.minimum;
      
      if (isComplete) {
        await updateModuleProgress(user.id, currentModule.id, currentSubmodule.id, {
          status: 'completed',
          completedAt: new Date(),
          wordCount: updatedEntry.wordCount
        });
        
        // Check if module is complete
        await checkModuleCompletion();
      }
      
    } else {
      // Create new entry
      await startSubmoduleEntry(currentSubmodule.id, content);
    }
    
    setError(null);
    
  } catch (error) {
    setError('Failed to save entry. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
```

### Module Completion Logic
```typescript
const checkModuleCompletion = async () => {
  try {
    const updatedProgress = await getModuleProgressFromFirestore(user.id, currentModule.id);
    const completedSubmodules = Object.values(updatedProgress.submoduleProgress)
      .filter(progress => progress.status === 'completed').length;
    
    if (completedSubmodules === currentModule.totalSubmodules) {
      // Mark module as completed
      await updateModuleProgress(user.id, currentModule.id, {
        overallProgress: 100,
        completedAt: new Date()
      });
      
      // Unlock next module or assign dynamic module
      await unlockNextModule();
      
      // Show completion celebration
      showModuleCompletionCelebration();
    }
    
  } catch (error) {
    console.error('Failed to check module completion:', error);
  }
};
```

## Firebase Integration

### Firestore Collections
```typescript
// Collection: module_progress
interface FirestoreModuleProgress {
  userId: string;
  moduleId: string;
  submoduleProgress: {
    [submoduleId: string]: {
      status: string;
      journalEntryId?: string;
      completedAt?: Timestamp;
      wordCount?: number;
    };
  };
  overallProgress: number;
  lastAccessed: Timestamp;
  unlockedAt: Timestamp;
  completedAt?: Timestamp;
}

// Collection: journal_entries (shared with freeform)
interface FirestoreJournalEntry {
  userId: string;
  content: string;
  wordCount: number;
  moduleId?: string;
  submoduleId?: string;
  entryType: 'freeform' | 'module_journal';
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
// Firestore security rules for module progress
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /module_progress/{progressId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    match /journal_entries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## LLM Integration

### Follow-up Prompt Generation
```typescript
const generateFollowUpPrompt = async (userResponse: string, originalPrompt: string) => {
  try {
    const systemPrompt = `You are a compassionate journaling assistant for eating disorder recovery. 
    Based on the user's response to a journaling prompt, generate a thoughtful follow-up question 
    that encourages deeper reflection. Keep questions open-ended and supportive.`;
    
    const response = await callHuggingFaceAPI({
      model: 'gpt2', // or appropriate model
      inputs: `${systemPrompt}\n\nOriginal Prompt: ${originalPrompt}\n\nUser Response: ${userResponse}\n\nFollow-up Question:`,
      max_length: 100,
      temperature: 0.7
    });
    
    return response.generated_text;
    
  } catch (error) {
    // Fallback to predefined follow-up prompts
    return getFallbackFollowUpPrompt(currentSubmodule.id);
  }
};
```

### Sentiment Analysis
```typescript
const analyzeSentiment = async (content: string) => {
  try {
    const response = await callHuggingFaceAPI({
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      inputs: content,
      max_length: 512
    });
    
    const sentiment = response[0].label;
    return sentiment === 'LABEL_0' ? 'negative' : 
           sentiment === 'LABEL_1' ? 'neutral' : 'positive';
    
  } catch (error) {
    return 'neutral'; // Default fallback
  }
};
```

## User Experience Features

### Progress Visualization
- **Progress Bar**: Visual completion percentage
- **Submodule Indicators**: Clear status for each submodule
- **Completion Celebrations**: Positive feedback for completed submodules
- **Module Unlocking**: Smooth transitions between modules

### Writing Assistance
- **Word Count Requirements**: Clear minimum and recommended word counts
- **Progress Indicators**: Visual feedback on completion progress
- **Auto-save**: Automatic saving every 30 seconds
- **Draft Recovery**: Restore unsaved content

### Navigation Features
- **Submodule Navigation**: Easy switching between submodules
- **Progress Persistence**: Remember where user left off
- **Completion Tracking**: Clear indicators of completed work
- **Module Progression**: Automatic unlocking of next modules

## Performance Considerations

### Data Loading
- **Module Caching**: Cache module content and prompts
- **Progress Caching**: Cache user progress locally
- **Lazy Loading**: Load submodule content on demand
- **Optimistic Updates**: Update UI immediately, sync later

### LLM Integration
- **Request Debouncing**: Debounce LLM requests
- **Response Caching**: Cache common LLM responses
- **Fallback Systems**: Graceful degradation when LLM unavailable
- **Rate Limiting**: Prevent excessive API calls

## Error Handling

### Network Errors
- **Retry Logic**: Automatic retry for failed saves
- **Offline Support**: Queue operations when offline
- **User Feedback**: Clear error messages and recovery options
- **Data Recovery**: Restore from cache when possible

### Validation Errors
- **Word Count Validation**: Ensure minimum requirements met
- **Content Validation**: Prevent empty or inappropriate content
- **Progress Validation**: Ensure progress data integrity
- **Module State Validation**: Prevent invalid module transitions

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical flow through submodule tabs
- **Keyboard Shortcuts**: Ctrl+S to save, arrow keys for navigation
- **Focus Management**: Proper focus indicators
- **Screen Reader**: Clear content descriptions

### Visual Accessibility
- **High Contrast**: Ensure sufficient color contrast
- **Progress Indicators**: Clear visual progress feedback
- **Status Indicators**: Clear completion status
- **Text Size**: Adjustable text size for prompts

## Future Enhancements

### Advanced Features
- **Adaptive Prompts**: LLM-generated personalized prompts
- **Progress Analytics**: Detailed progress analysis
- **Module Recommendations**: AI-powered module suggestions
- **Collaborative Features**: Share insights with trusted contacts

### AI Integration
- **Personalized Insights**: AI-generated personal insights
- **Pattern Recognition**: Identify writing patterns over time
- **Recovery Tracking**: Track recovery progress through content
- **Crisis Detection**: Identify concerning content patterns

### Analytics Integration
- **Engagement Metrics**: Track module completion rates
- **Time Analysis**: Analyze time spent on different modules
- **Content Analysis**: Analyze writing patterns and themes
- **Progress Prediction**: Predict completion timelines

## Security Considerations

### Data Privacy
- **Content Encryption**: Encrypt sensitive journal content
- **Access Control**: Ensure only user can access their entries
- **Module Privacy**: Protect module progress data
- **Export Control**: Allow users to export their module data

### Content Moderation
- **Crisis Detection**: Identify crisis indicators in responses
- **Professional Support**: Provide resources for users in crisis
- **Content Filtering**: Filter inappropriate content
- **Privacy Protection**: Never share content without consent

---

*This documentation provides comprehensive requirements for implementing the ModuleScreen with structured journaling, progress tracking, and LLM integration.* 