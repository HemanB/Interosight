// Journal Session Types
export interface JournalSession {
  id: string;
  userId: string;
  moduleId?: number;
  content: string;
  embedding: number[];
  tags: string[];
  riskScore: RiskScore;
  feedback: SessionFeedback;
  metadata: SessionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskScore {
  phq9: number; // 0-27
  edeq: number; // 0-6
  edqol: number; // 0-100
  crisisRisk: 'low' | 'medium' | 'high';
  factors: string[];
  timestamp: Date;
}

export interface SessionFeedback {
  helpfulness: number; // 1-5 scale
  emotionalImpact: 'positive' | 'neutral' | 'negative';
  intent: 'explore' | 'validate' | 'reframe' | 'support';
  userNotes?: string;
}

export interface SessionMetadata {
  timeOfDay: string; // morning, afternoon, evening, night
  dayOfWeek: number; // 0-6
  entryStreak: number;
  daysSinceLastEntry: number;
  location?: string;
  mood?: string;
  physiologicalData?: PhysiologicalData;
}

export interface PhysiologicalData {
  heartRate?: number;
  heartRateVariability?: number;
  respiratoryRate?: number;
  timestamp: Date;
}

// User Memory Types
export interface UserMemory {
  userId: string;
  insights: string[];
  frequentTopics: string[];
  recentEntries: string[];
  emotionalPatterns: EmotionalPattern[];
  lastUpdated: Date;
}

export interface EmotionalPattern {
  pattern: string;
  frequency: number;
  triggers: string[];
  lastOccurrence: Date;
}

// Logging Types
export interface LogEntry {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  metadata: LogMetadata;
  embedding: number[];
  createdAt: Date;
}

export interface LogMetadata {
  timeOfDay: string;
  location?: string;
  mood?: string;
  context?: string;
  physiologicalData?: PhysiologicalData;
}

// Tag System
export type LogTag = 
  | 'breakfast' | 'lunch' | 'dinner' | 'snack'
  | 'trigger' | 'binge' | 'purge' | 'body-checking'
  | 'exercise' | 'restriction' | 'other';

export interface TaggedContent {
  content: string;
  tags: LogTag[];
  confidence: number; // 0-1
} 