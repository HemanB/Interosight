export interface AuthValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation rules
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

// Display name validation rules
const DISPLAY_NAME_MIN_LENGTH = 2;
const DISPLAY_NAME_MAX_LENGTH = 50;

export class AuthValidation {
  // Validate login data
  static validateLogin(data: LoginData): AuthValidationResult {
    const errors: Record<string, string[]> = {};

    // Email validation
    if (!data.email) {
      errors.email = ['Email is required'];
    } else if (!EMAIL_REGEX.test(data.email)) {
      errors.email = ['Please enter a valid email address'];
    }

    // Password validation
    if (!data.password) {
      errors.password = ['Password is required'];
    } else if (data.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = [`Password must be at least ${PASSWORD_MIN_LENGTH} characters`];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate registration data
  static validateRegister(data: RegisterData): AuthValidationResult {
    const errors: Record<string, string[]> = {};

    // Email validation
    if (!data.email) {
      errors.email = ['Email is required'];
    } else if (!EMAIL_REGEX.test(data.email)) {
      errors.email = ['Please enter a valid email address'];
    }

    // Password validation
    if (!data.password) {
      errors.password = ['Password is required'];
    } else if (data.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = [`Password must be at least ${PASSWORD_MIN_LENGTH} characters`];
    } else if (data.password.length > PASSWORD_MAX_LENGTH) {
      errors.password = [`Password must be no more than ${PASSWORD_MAX_LENGTH} characters`];
    }

    // Display name validation
    if (!data.displayName) {
      errors.displayName = ['Display name is required'];
    } else if (data.displayName.length < DISPLAY_NAME_MIN_LENGTH) {
      errors.displayName = [`Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters`];
    } else if (data.displayName.length > DISPLAY_NAME_MAX_LENGTH) {
      errors.displayName = [`Display name must be no more than ${DISPLAY_NAME_MAX_LENGTH} characters`];
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(data.displayName)) {
      errors.displayName = ['Display name can only contain letters, numbers, spaces, hyphens, and underscores'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate password change
  static validatePasswordChange(data: PasswordChangeData): AuthValidationResult {
    const errors: Record<string, string[]> = {};

    // Current password validation
    if (!data.currentPassword) {
      errors.currentPassword = ['Current password is required'];
    }

    // New password validation
    if (!data.newPassword) {
      errors.newPassword = ['New password is required'];
    } else if (data.newPassword.length < PASSWORD_MIN_LENGTH) {
      errors.newPassword = [`Password must be at least ${PASSWORD_MIN_LENGTH} characters`];
    } else if (data.newPassword.length > PASSWORD_MAX_LENGTH) {
      errors.newPassword = [`Password must be no more than ${PASSWORD_MAX_LENGTH} characters`];
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = ['Please confirm your new password'];
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }

    // Check if new password is different from current
    if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
      errors.newPassword = ['New password must be different from current password'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate email for password reset
  static validateEmail(email: string): AuthValidationResult {
    const errors: Record<string, string[]> = {};

    if (!email) {
      errors.email = ['Email is required'];
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = ['Please enter a valid email address'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get validation error messages as a single string
  static getErrorMessage(result: AuthValidationResult): string {
    if (result.isValid) return '';
    
    const allErrors = Object.values(result.errors).flat();
    return allErrors.join('\n');
  }

  // Sanitize input data
  static sanitizeLoginData(data: LoginData): LoginData {
    return {
      email: data.email.trim().toLowerCase(),
      password: data.password.trim()
    };
  }

  static sanitizeRegisterData(data: RegisterData): RegisterData {
    return {
      email: data.email.trim().toLowerCase(),
      password: data.password.trim(),
      displayName: data.displayName.trim()
    };
  }

  static sanitizePasswordChangeData(data: PasswordChangeData): PasswordChangeData {
    return {
      currentPassword: data.currentPassword.trim(),
      newPassword: data.newPassword.trim(),
      confirmPassword: data.confirmPassword.trim()
    };
  }
} 