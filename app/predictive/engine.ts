export interface UserPattern {
  id: string;
  timestamp: Date;
  type: 'meal' | 'trigger' | 'mood' | 'crisis';
  data: any;
  severity?: number; // 1-10 scale
}

export interface Prediction {
  type: 'risk' | 'opportunity' | 'insight';
  confidence: number; // 0-1
  message: string;
  actionable: boolean;
  action?: string;
}

export interface UserInsights {
  patterns: UserPattern[];
  predictions: Prediction[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class PredictiveEngine {
  private userPatterns: UserPattern[] = [];
  private crisisThreshold = 0.7;

  addPattern(pattern: UserPattern): void {
    this.userPatterns.push(pattern);
    this.analyzePatterns();
  }

  private analyzePatterns(): void {
    // Analyze recent patterns for trends
    const recentPatterns = this.userPatterns
      .filter(p => p.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Last 7 days

    // Detect crisis patterns
    const crisisPatterns = recentPatterns.filter(p => 
      p.type === 'crisis' || (p.severity && p.severity > 7)
    );

    if (crisisPatterns.length > 0) {
      this.triggerCrisisAlert();
    }

    // Analyze meal patterns
    const mealPatterns = recentPatterns.filter(p => p.type === 'meal');
    this.analyzeMealPatterns(mealPatterns);

    // Analyze trigger patterns
    const triggerPatterns = recentPatterns.filter(p => p.type === 'trigger');
    this.analyzeTriggerPatterns(triggerPatterns);
  }

  private triggerCrisisAlert(): void {
    // Implementation for crisis detection and alerting
    console.log('Crisis pattern detected - consider immediate intervention');
  }

  private analyzeMealPatterns(patterns: UserPattern[]): void {
    if (patterns.length === 0) return;

    // Analyze meal timing, frequency, and associated moods
    const mealFrequency = patterns.length;
    const averageSeverity = patterns.reduce((sum, p) => sum + (p.severity || 0), 0) / patterns.length;

    if (mealFrequency < 3) {
      this.addPrediction({
        type: 'risk',
        confidence: 0.8,
        message: 'You\'ve logged fewer meals than usual this week. Remember that regular nourishment supports your recovery.',
        actionable: true,
        action: 'Consider reaching out to your support team'
      });
    }

    if (averageSeverity > 6) {
      this.addPrediction({
        type: 'insight',
        confidence: 0.7,
        message: 'Meal times seem to be particularly challenging right now. This is normal in recovery.',
        actionable: true,
        action: 'Try some gentle self-compassion exercises'
      });
    }
  }

  private analyzeTriggerPatterns(patterns: UserPattern[]): void {
    if (patterns.length === 0) return;

    // Identify common triggers and patterns
    const triggerTypes = patterns.map(p => p.data?.triggerType || 'unknown');
    const mostCommonTrigger = this.findMostCommon(triggerTypes);

    if (mostCommonTrigger && patterns.length > 2) {
      this.addPrediction({
        type: 'insight',
        confidence: 0.6,
        message: `I notice that ${mostCommonTrigger} seems to be a recurring challenge. You're not alone in this.`,
        actionable: true,
        action: 'Consider discussing this pattern with your therapist'
      });
    }
  }

  private findMostCommon<T>(array: T[]): T | null {
    const counts = array.reduce((acc, item) => {
      acc[item as any] = (acc[item as any] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(counts));
    const mostCommon = Object.keys(counts).find(key => counts[key] === maxCount);
    
    return mostCommon as T || null;
  }

  private predictions: Prediction[] = [];

  private addPrediction(prediction: Prediction): void {
    this.predictions.push(prediction);
  }

  getInsights(): UserInsights {
    const recentPatterns = this.userPatterns
      .filter(p => p.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    const riskLevel = this.calculateRiskLevel(recentPatterns);
    const recommendations = this.generateRecommendations(recentPatterns, riskLevel);

    return {
      patterns: recentPatterns,
      predictions: this.predictions.slice(-5), // Last 5 predictions
      riskLevel,
      recommendations
    };
  }

  private calculateRiskLevel(patterns: UserPattern[]): 'low' | 'medium' | 'high' {
    const crisisCount = patterns.filter(p => p.type === 'crisis').length;
    const highSeverityCount = patterns.filter(p => p.severity && p.severity > 7).length;

    if (crisisCount > 0 || highSeverityCount > 2) return 'high';
    if (highSeverityCount > 0 || patterns.length < 3) return 'medium';
    return 'low';
  }

  private generateRecommendations(patterns: UserPattern[], riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'high') {
      recommendations.push('Consider reaching out to your treatment team immediately');
      recommendations.push('Use your crisis tools and emergency contacts');
    }

    if (patterns.length < 5) {
      recommendations.push('Try to log your experiences regularly - it helps track your progress');
    }

    if (patterns.some(p => p.type === 'meal' && p.severity && p.severity > 5)) {
      recommendations.push('Meal times seem challenging - remember to be gentle with yourself');
    }

    if (recommendations.length === 0) {
      recommendations.push('You\'re doing great! Keep up the good work in your recovery journey');
    }

    return recommendations;
  }

  clearPredictions(): void {
    this.predictions = [];
  }
}

export const predictiveEngine = new PredictiveEngine(); 