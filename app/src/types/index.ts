// User Profile
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  age?: number;
  gender?: string;
  recoveryStage?: 'early' | 'maintenance' | 'advanced';
  createdAt: string; // ISO date string
  lastActive: string;
  preferences: UserPreferences;
  privacySettings: PrivacySettings;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    reflection: boolean;
    encouragement: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
  };
  ui: {
    theme: 'light' | 'dark';
    textSize: 'small' | 'medium' | 'large';
  };
}

export interface PrivacySettings {
  dataProcessing: boolean;
  thirdPartySharing: boolean;
  marketingEmails: boolean;
  researchParticipation: boolean;
}

// Module System
export interface Module {
  id: string;
  title: string;
  description: string;
  type: 'base' | 'dynamic';
  order: number;
  submodules: Submodule[];
}

export interface Submodule {
  id: string;
  title: string;
  description: string;
  prompts: string[];
  order: number;
  requiredWordCount: number;
}

export interface ModuleProgress {
  moduleId: string;
  userId: string;
  completed: boolean;
  completedSubmodules: string[];
  startedAt: string;
  completedAt?: string;
  currentSubmodule?: string;
}

// Journal Entry
export interface JournalEntry {
  id: string;
  userId: string;
  moduleId?: string;
  submoduleId?: string;
  prompt: string;
  response: string;
  wordCount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  sessionId: string;
  isCompleted: boolean;
  metadata: JournalMetadata;
}

export interface JournalMetadata {
  promptVersion: string;
  responseTime: number; // milliseconds
  editCount: number;
  tags: string[];
}

export interface JournalSession {
  id: string;
  userId: string;
  moduleId: string;
  submoduleId: string;
  startedAt: string;
  endedAt?: string;
  entries: string[]; // JournalEntry IDs
  isCompleted: boolean;
}

// Meal Log - Updated to match new logging system
export interface MealLog {
  id: string;
  userId: string;
  mealType: 'Breakfast' | 'Morning Snack' | 'Lunch' | 'Afternoon Snack' | 'Dinner' | 'Evening Snack' | 'Late Night';
  description: string; // Combined description and reflection
  satietyPre: number; // 1-10 scale with emoji mapping
  satietyPost: number; // 1-10 scale with emoji mapping (satiation)
  emotionPre: string[]; // Multi-select emotions
  emotionPost: string[]; // Multi-select emotions
  affectPre: number; // 1-10 scale with emoji mapping (general affect)
  affectPost: number; // 1-10 scale with emoji mapping (general affect)
  socialContext: 'Alone' | 'With family' | 'With friends' | 'With colleagues' | 'In a room with others' | 'On video call';
  locationContext: 'Home' | 'Work' | 'School' | 'Restaurant' | 'Cafeteria' | 'Bedroom' | 'Kitchen' | 'Car' | 'Other';
  createdAt: string; // ISO date string
  wordCount: number;
}

// Behavior Log - Updated to match new logging system
export interface BehaviorLog {
  id: string;
  userId: string;
  description: string; // Combined description and reflection
  emotionPre: string[]; // Multi-select emotions
  emotionPost: string[]; // Multi-select emotions
  affectPre: number; // 1-10 scale with emoji mapping (general affect)
  affectPost: number; // 1-10 scale with emoji mapping (general affect)
  createdAt: string; // ISO date string
  wordCount: number;
}

// Insights & Analytics
export interface Insight {
  id: string;
  userId: string;
  type: 'pattern' | 'recommendation' | 'celebration';
  title: string;
  description: string;
  data: any; // Flexible data structure
  createdAt: string;
  isRead: boolean;
}

export interface Pattern {
  id: string;
  userId: string;
  type: 'emotional' | 'behavioral' | 'temporal';
  description: string;
  confidence: number; // 0-1
  data: any;
  createdAt: string;
}

// Emoji mapping constants
export const SATIETY_EMOJIS = ['😵', '😰', '😨', '😟', '😐', '🙂', '😊', '😋', '😍', '🤤'];
export const AFFECT_EMOJIS = ['😵‍💫', '😫', '😞', '😔', '😐', '🙂', '😊', '😄', '🤩', '🥳'];

// Common emotion options (matching LogScreen)
export const EMOTIONS = [
  'Anxious', 'Calm', 'Excited', 'Sad', 'Happy', 'Stressed', 'Relaxed', 'Guilty',
  'Frustrated', 'Content', 'Worried', 'Confident', 'Overwhelmed', 'Peaceful'
];

// Meal type options
export const MEAL_TYPES = [
  'Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack', 'Late Night'
];

// Location options
export const LOCATIONS = [
  'Home', 'Work', 'School', 'Restaurant', 'Cafeteria', 'Bedroom', 'Kitchen', 'Car', 'Other'
];

// Social context options
export const SOCIAL_CONTEXTS = [
  'Alone', 'With family', 'With friends', 'With colleagues', 'In a room with others', 'On video call'
];

// Demo Mode
export interface DemoData {
  profile: Partial<UserProfile>;
  journalEntries: JournalEntry[];
  mealLogs: MealLog[];
  behaviorLogs: BehaviorLog[];
  insights: Insight[];
} 