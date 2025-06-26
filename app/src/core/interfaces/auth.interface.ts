import { User, UserProfile } from '../types/auth.types';

export interface AuthService {
  signUp(email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  resetPassword(email: string): Promise<void>;
  updateProfile(updates: Partial<UserProfile>): Promise<User>;
} 