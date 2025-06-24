import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile, AuthError } from '../lib/auth';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  register: (email: string, password: string, displayName: string, profileData?: Partial<UserProfile['profile']>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile['profile']>) => Promise<void>;
  updatePreferences: (updates: Partial<UserProfile['preferences']>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!auth) {
          console.warn('Firebase Auth not initialized, using offline mode');
          setIsLoading(false);
          return;
        }
        // Get current user from auth service - with fallback
        try {
          const currentUser = await authService.getCurrentUser();
          const currentProfile = await authService.getUserProfile();
          setUser(currentUser);
          setUserProfile(currentProfile);
        } catch (error) {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        setUser(null);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const handleError = (error: any) => {
    if (error.code && error.message) {
      setError(error);
    } else {
      setError({ code: 'unknown', message: 'An unexpected error occurred' });
    }
  };

  const clearError = () => {
    setError(null);
  };

  const register = async (
    email: string, 
    password: string, 
    displayName: string, 
    profileData?: Partial<UserProfile['profile']>
  ) => {
    try {
      setIsLoading(true);
      clearError();
      const { user: newUser, profile } = await authService.registerUser(
        email, 
        password, 
        displayName, 
        profileData
      );
      setUser(newUser);
      setUserProfile(profile);
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();
      const { user: signedInUser, profile } = await authService.signIn(email, password);
      setUser(signedInUser);
      setUserProfile(profile);
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      clearError();
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile['profile']>) => {
    try {
      clearError();
      await authService.updateProfile(updates);
      const updatedProfile = await authService.getUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  const updatePreferences = async (updates: Partial<UserProfile['preferences']>) => {
    try {
      clearError();
      await authService.updatePreferences(updates);
      const updatedProfile = await authService.getUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      clearError();
      await authService.resetPassword(email);
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      clearError();
      await authService.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      setIsLoading(true);
      clearError();
      await authService.deleteAccount(password);
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    error,
    register,
    signIn,
    signOut,
    updateProfile,
    updatePreferences,
    resetPassword,
    changePassword,
    deleteAccount,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 