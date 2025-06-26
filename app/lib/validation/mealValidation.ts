export interface MealValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface TriggerValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface MealData {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
}

export interface TriggerData {
  trigger: string;
  severity: 'low' | 'medium' | 'high';
  notes?: string;
  copingStrategies?: string[];
}

// Validation constants
const DESCRIPTION_MIN_LENGTH = 3;
const DESCRIPTION_MAX_LENGTH = 500;
const TRIGGER_MIN_LENGTH = 3;
const TRIGGER_MAX_LENGTH = 200;
const NOTES_MAX_LENGTH = 1000;
const COPING_STRATEGY_MAX_LENGTH = 200;
const MAX_COPING_STRATEGIES = 10;

export class MealValidation {
  // Validate meal data
  static validateMeal(data: MealData): MealValidationResult {
    const errors: Record<string, string[]> = {};

    // Meal type validation
    if (!data.type) {
      errors.type = ['Meal type is required'];
    } else if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(data.type)) {
      errors.type = ['Please select a valid meal type'];
    }

    // Description validation
    if (!data.description) {
      errors.description = ['Meal description is required'];
    } else if (data.description.length < DESCRIPTION_MIN_LENGTH) {
      errors.description = [`Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`];
    } else if (data.description.length > DESCRIPTION_MAX_LENGTH) {
      errors.description = [`Description must be no more than ${DESCRIPTION_MAX_LENGTH} characters`];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate trigger data
  static validateTrigger(data: TriggerData): TriggerValidationResult {
    const errors: Record<string, string[]> = {};

    // Trigger description validation
    if (!data.trigger) {
      errors.trigger = ['Trigger description is required'];
    } else if (data.trigger.length < TRIGGER_MIN_LENGTH) {
      errors.trigger = [`Trigger description must be at least ${TRIGGER_MIN_LENGTH} characters`];
    } else if (data.trigger.length > TRIGGER_MAX_LENGTH) {
      errors.trigger = [`Trigger description must be no more than ${TRIGGER_MAX_LENGTH} characters`];
    }

    // Severity validation
    if (!data.severity) {
      errors.severity = ['Severity level is required'];
    } else if (!['low', 'medium', 'high'].includes(data.severity)) {
      errors.severity = ['Please select a valid severity level'];
    }

    // Notes validation (optional)
    if (data.notes && data.notes.length > NOTES_MAX_LENGTH) {
      errors.notes = [`Notes must be no more than ${NOTES_MAX_LENGTH} characters`];
    }

    // Coping strategies validation (optional)
    if (data.copingStrategies) {
      if (data.copingStrategies.length > MAX_COPING_STRATEGIES) {
        errors.copingStrategies = [`You can add up to ${MAX_COPING_STRATEGIES} coping strategies`];
      } else {
        data.copingStrategies.forEach((strategy, index) => {
          if (strategy.length > COPING_STRATEGY_MAX_LENGTH) {
            if (!errors.copingStrategies) errors.copingStrategies = [];
            errors.copingStrategies.push(`Coping strategy ${index + 1} must be no more than ${COPING_STRATEGY_MAX_LENGTH} characters`);
          }
        });
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get validation error messages as a single string
  static getMealErrorMessage(result: MealValidationResult): string {
    if (result.isValid) return '';
    
    const allErrors = Object.values(result.errors).flat();
    return allErrors.join('\n');
  }

  static getTriggerErrorMessage(result: TriggerValidationResult): string {
    if (result.isValid) return '';
    
    const allErrors = Object.values(result.errors).flat();
    return allErrors.join('\n');
  }

  // Sanitize meal data
  static sanitizeMealData(data: MealData): MealData {
    return {
      type: data.type,
      description: data.description.trim()
    };
  }

  // Sanitize trigger data
  static sanitizeTriggerData(data: TriggerData): TriggerData {
    return {
      trigger: data.trigger.trim(),
      severity: data.severity,
      notes: data.notes?.trim(),
      copingStrategies: data.copingStrategies?.map(strategy => strategy.trim()).filter(Boolean)
    };
  }

  // Validate meal type
  static isValidMealType(type: string): type is 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    return ['breakfast', 'lunch', 'dinner', 'snack'].includes(type);
  }

  // Validate severity level
  static isValidSeverity(severity: string): severity is 'low' | 'medium' | 'high' {
    return ['low', 'medium', 'high'].includes(severity);
  }

  // Get meal type options
  static getMealTypeOptions() {
    return [
      { key: 'breakfast', label: 'Breakfast', icon: 'sunny' },
      { key: 'lunch', label: 'Lunch', icon: 'restaurant' },
      { key: 'dinner', label: 'Dinner', icon: 'moon' },
      { key: 'snack', label: 'Snack', icon: 'cafe' }
    ];
  }

  // Get severity options
  static getSeverityOptions() {
    return [
      { key: 'low', label: 'Low', color: '#10b981' },
      { key: 'medium', label: 'Medium', color: '#f59e0b' },
      { key: 'high', label: 'High', color: '#ef4444' }
    ];
  }
} 