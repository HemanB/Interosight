// Module System Types
export interface Module {
  id: number;
  title: string;
  description: string;
  prerequisites: number[];
  activities: ActivityConfig[];
  reflectionPrompts: ReflectionPrompt[];
  estimatedDuration: number; // in minutes
  tags: string[];
  isActive: boolean;
}

export interface ActivityConfig {
  id: string;
  type: 'definition-match' | 'cloze-text' | 'soft-quiz' | 'interactive';
  title: string;
  description: string;
  content: any; // Activity-specific content
  points: number;
  required: boolean;
}

export interface ReflectionPrompt {
  id: string;
  title: string;
  prompt: string;
  followUpPrompts: string[];
  intent: 'explore' | 'validate' | 'reframe' | 'support';
  tags: string[];
}

// User Progress Types
export interface UserModuleProgress {
  userId: string;
  moduleId: number;
  startedAt: Date;
  completedAt?: Date;
  activitiesCompleted: string[];
  reflectionSessions: string[];
  score: number;
  isActive: boolean;
}

// Module Completion Status
export interface ModuleStatus {
  moduleId: number;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  progress: number; // 0-100
  activitiesCompleted: number;
  totalActivities: number;
} 