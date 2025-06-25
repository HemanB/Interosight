// Local user interface (matches the one in auth.ts)
export interface LocalUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  preferences: {
    biometricEnabled: boolean;
    notifications: boolean;
    dataCollectionConsent: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  profile: {
    recoveryStreak?: number;
    totalXP?: number;
    emergencyContacts?: EmergencyContact[];
    crisisKeywords?: string[];
    mealLoggingEnabled?: boolean;
    chatHistory?: ChatMessage[];
    triggerLogs?: TriggerLog[];
    dbtTools?: DBTTool[];
  };
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  crisisDetected?: boolean;
}

export interface TriggerLog {
  id: string;
  trigger: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  notes?: string;
  copingStrategies?: string[];
}

export interface DBTTool {
  id: string;
  name: string;
  description: string;
  category: 'distress-tolerance' | 'mindfulness' | 'emotion-regulation' | 'interpersonal-effectiveness';
  lastUsed?: Date;
  effectiveness?: number;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthState {
  user: LocalUser | null;
  loading: boolean;
  error: AuthError | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// Export LocalUser as UserProfile for backward compatibility
export type UserProfile = LocalUser;

// Authentication context type
export interface AuthContextType {
  user: LocalUser | null;
  userProfile: LocalUser | null;
  isLoading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<LocalUser>;
  register: (email: string, password: string, displayName: string) => Promise<LocalUser>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<LocalUser['profile']>) => Promise<void>;
  updatePreferences: (updates: Partial<LocalUser['preferences']>) => Promise<void>;
  setupBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  clearError: () => void;
}

// Registration data interface
export interface RegistrationData {
  email: string;
  password: string;
  displayName: string;
  profileData?: Partial<UserProfile['profile']>;
}

// Login data interface
export interface LoginData {
  email: string;
  password: string;
}

// Profile update interface
export interface ProfileUpdate {
  profile?: Partial<UserProfile['profile']>;
  preferences?: Partial<UserProfile['preferences']>;
} 