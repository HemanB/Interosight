// Simplified validation for chat functionality
export interface ChatValidationResult {
  isValid: boolean;
  errors: string[];
}

// Basic input validation
export function validateUserInput(input: string): ChatValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'string') {
    errors.push('Input is required');
  } else {
    const trimmedInput = input.trim();
    
    if (trimmedInput.length === 0) {
      errors.push('Input cannot be empty');
    }
    
    if (trimmedInput.length > 1000) {
      errors.push('Input is too long (maximum 1000 characters)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitize chat message content
export function sanitizeChatMessage(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let sanitized = content.trim();
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Remove potentially harmful characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
} 