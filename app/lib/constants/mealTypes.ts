// Meal type constants
export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny', color: '#fbbf24' },
  { key: 'lunch', label: 'Lunch', icon: 'restaurant', color: '#10b981' },
  { key: 'dinner', label: 'Dinner', icon: 'moon', color: '#6366f1' },
  { key: 'snack', label: 'Snack', icon: 'cafe', color: '#ec4899' }
] as const;

export type MealType = typeof MEAL_TYPES[number]['key'];

// Trigger severity constants
export const TRIGGER_SEVERITIES = [
  { key: 'low', label: 'Low', color: '#10b981', description: 'Mild discomfort' },
  { key: 'medium', label: 'Medium', color: '#f59e0b', description: 'Moderate distress' },
  { key: 'high', label: 'High', color: '#ef4444', description: 'Significant distress' }
] as const;

export type TriggerSeverity = typeof TRIGGER_SEVERITIES[number]['key'];

// Meal type utilities
export const MealTypeUtils = {
  getMealType(key: string) {
    return MEAL_TYPES.find(type => type.key === key);
  },

  getMealTypeColor(key: string): string {
    const mealType = this.getMealType(key);
    return mealType?.color || '#6366f1';
  },

  getMealTypeIcon(key: string): string {
    const mealType = this.getMealType(key);
    return mealType?.icon || 'restaurant';
  },

  getMealTypeLabel(key: string): string {
    const mealType = this.getMealType(key);
    return mealType?.label || 'Meal';
  },

  isValidMealType(key: string): key is MealType {
    return MEAL_TYPES.some(type => type.key === key);
  }
};

// Trigger severity utilities
export const TriggerSeverityUtils = {
  getSeverity(key: string) {
    return TRIGGER_SEVERITIES.find(severity => severity.key === key);
  },

  getSeverityColor(key: string): string {
    const severity = this.getSeverity(key);
    return severity?.color || '#64748b';
  },

  getSeverityLabel(key: string): string {
    const severity = this.getSeverity(key);
    return severity?.label || 'Unknown';
  },

  getSeverityDescription(key: string): string {
    const severity = this.getSeverity(key);
    return severity?.description || '';
  },

  isValidSeverity(key: string): key is TriggerSeverity {
    return TRIGGER_SEVERITIES.some(severity => severity.key === key);
  }
};

// Default meal suggestions
export const DEFAULT_MEAL_SUGGESTIONS = {
  breakfast: [
    'Oatmeal with berries',
    'Toast with avocado',
    'Smoothie bowl',
    'Eggs and toast',
    'Yogurt with granola'
  ],
  lunch: [
    'Salad with protein',
    'Sandwich or wrap',
    'Soup and bread',
    'Rice bowl',
    'Pasta dish'
  ],
  dinner: [
    'Grilled chicken with vegetables',
    'Fish with rice',
    'Stir fry',
    'Pasta with sauce',
    'Bowl of soup'
  ],
  snack: [
    'Fruit',
    'Nuts or trail mix',
    'Crackers with cheese',
    'Smoothie',
    'Granola bar'
  ]
};

// Meal logging prompts
export const MEAL_PROMPTS = {
  description: 'Focus on what you enjoyed, how it tasted, or how it made you feel',
  encouragement: 'Every meal is a step toward healing. You\'re doing great!',
  success: 'Great job taking care of yourself. Every meal is a step toward healing.',
  reminder: 'Remember to be kind to yourself. There are no "good" or "bad" foods.'
};

// Trigger logging prompts
export const TRIGGER_PROMPTS = {
  description: 'Describe what triggered you and how you\'re feeling',
  encouragement: 'It\'s okay to have triggers. You\'re learning to cope with them.',
  success: 'Thank you for logging this trigger. You\'re building awareness.',
  reminder: 'Remember, triggers are temporary. You have tools to help you through this.'
}; 