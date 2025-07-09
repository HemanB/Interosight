// Progress Tracking Types
export interface UserProgress {
  userId: string;
  currentModule: number;
  modulesCompleted: number[];
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  lastActive: Date;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'engagement' | 'recovery' | 'milestone' | 'streak';
}

// Analytics Types
export interface ProgressAnalytics {
  userId: string;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  data: AnalyticsData;
  insights: AnalyticsInsight[];
  lastUpdated: Date;
}

export interface AnalyticsData {
  sessionFrequency: SessionFrequencyData;
  topicVolume: TopicVolumeData;
  riskTrends: RiskTrendData;
  engagementMetrics: EngagementMetrics;
}

export interface SessionFrequencyData {
  totalSessions: number;
  averageSessionsPerWeek: number;
  mostActiveDay: string;
  mostActiveTime: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface TopicVolumeData {
  topics: TopicData[];
  dominantTopics: string[];
  topicEvolution: TopicEvolution[];
}

export interface TopicData {
  topic: string;
  volume: number;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface TopicEvolution {
  date: Date;
  topics: TopicData[];
}

export interface RiskTrendData {
  phq9Trend: TrendData;
  edeqTrend: TrendData;
  edqolTrend: TrendData;
  crisisRiskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface EngagementMetrics {
  dailyActiveDays: number;
  averageSessionDuration: number;
  moduleCompletionRate: number;
  reflectionEngagement: number;
  loggingConsistency: number;
}

export interface AnalyticsInsight {
  id: string;
  type: 'pattern' | 'trend' | 'recommendation' | 'milestone';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  actionText?: string;
  timestamp: Date;
}

// Embedding Analytics
export interface EmbeddingAnalytics {
  userId: string;
  embeddings: EmbeddingData[];
  clusters: EmbeddingCluster[];
  similarityMatrix: number[][];
  driftAnalysis: DriftAnalysis;
}

export interface EmbeddingData {
  sessionId: string;
  embedding: number[];
  timestamp: Date;
  tags: string[];
  content: string;
}

export interface EmbeddingCluster {
  id: string;
  centroid: number[];
  sessions: string[];
  dominantTopics: string[];
  averageSentiment: 'positive' | 'neutral' | 'negative';
}

export interface DriftAnalysis {
  overallDrift: number; // 0-1, higher = more drift
  topicDrift: TopicDrift[];
  recommendations: string[];
}

export interface TopicDrift {
  topic: string;
  drift: number;
  direction: 'positive' | 'negative' | 'neutral';
  significance: 'low' | 'medium' | 'high';
} 