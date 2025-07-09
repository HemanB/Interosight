export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserProfile {
  displayName?: string;
  email?: string;
  character?: string;
  username?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}

export interface AuthError {
  code: string;
  message: string;
} 