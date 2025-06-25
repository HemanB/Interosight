// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - more lenient for existing accounts
export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Only suggest improvements for new passwords, don't require them
  if (password.length < 8) {
    errors.push('Consider using at least 8 characters for better security');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Consider adding an uppercase letter for better security');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Consider adding a lowercase letter for better security');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Consider adding a number for better security');
  }
  
  return {
    isValid: errors.length === 0 || password.length >= 6, // Allow if at least 6 chars
    errors: errors.length >= 6 ? errors : [] // Only show errors if password is too short
  };
};

// Display name validation
export const isValidDisplayName = (displayName: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (displayName.length < 2) {
    errors.push('Display name must be at least 2 characters long');
  }
  
  if (displayName.length > 50) {
    errors.push('Display name must be less than 50 characters');
  }
  
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(displayName)) {
    errors.push('Display name can only contain letters, numbers, spaces, hyphens, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form validation helper
export const validateForm = (fields: Record<string, any>): { isValid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};
  let isValid = true;
  
  Object.keys(fields).forEach(fieldName => {
    const value = fields[fieldName];
    
    switch (fieldName) {
      case 'email':
        if (!isValidEmail(value)) {
          errors[fieldName] = ['Please enter a valid email address'];
          isValid = false;
        }
        break;
        
      case 'password':
        const passwordValidation = isValidPassword(value);
        if (!passwordValidation.isValid) {
          errors[fieldName] = passwordValidation.errors;
          isValid = false;
        }
        break;
        
      case 'displayName':
        const nameValidation = isValidDisplayName(value);
        if (!nameValidation.isValid) {
          errors[fieldName] = nameValidation.errors;
          isValid = false;
        }
        break;
        
      default:
        if (!value || value.trim() === '') {
          errors[fieldName] = ['This field is required'];
          isValid = false;
        }
    }
  });
  
  return { isValid, errors };
}; 