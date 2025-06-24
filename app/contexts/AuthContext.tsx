import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile, AuthError } from '../lib/auth';
import { User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BiometricAuthService } from '../lib/biometrics';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  biometricType: string | null;
  biometricAvailable: boolean;
  error: AuthError | null;
  
  // Authentication methods
  register: (email: string, password: string, displayName: string, profileData?: Partial<UserProfile['profile']>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Biometric methods
  setupBiometric: () => Promise<boolean>;
  authenticateWithBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  
  // Profile methods
  updateProfile: (updates: Partial<UserProfile['profile']>) => Promise<void>;
  updatePreferences: (updates: Partial<UserProfile['preferences']>) => Promise<void>;
  
  // Account management
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  
  // Utility methods
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
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Ensure Firebase is initialized
        if (!auth) {
          console.warn('Firebase Auth not initialized, using offline mode');
          // Set loading to false so app can still be used
          setIsLoading(false);
          return;
        }

        // Check biometric availability and type
        try {
          const available = await BiometricAuthService.isBiometricAvailable();
          const type = await BiometricAuthService.getBiometricType();
          
          setBiometricAvailable(available);
          setBiometricType(type);
        } catch (error) {
          console.warn('Error checking biometric availability:', error);
          setBiometricAvailable(false);
          setBiometricType(null);
        }
        
        // Check if biometric is enabled
        try {
          const biometricStatus = await AsyncStorage.getItem('biometricEnabled');
          setBiometricEnabled(biometricStatus === 'true');
        } catch (error) {
          console.warn('Error checking biometric status:', error);
          setBiometricEnabled(false);
        }
        
        // Get current user from auth service - with fallback
        try {
          const currentUser = authService.getCurrentUser();
          const currentProfile = authService.getUserProfile();
          
          setUser(currentUser);
          setUserProfile(currentProfile);
        } catch (error) {
          console.warn('Error getting current user:', error);
          // Don't set error state, just continue without user
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Don't set error state for initialization issues, just continue
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
      setBiometricEnabled(profile.preferences.biometricEnabled);
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
      setBiometricEnabled(false);
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setupBiometric = async (): Promise<boolean> => {
    try {
      clearError();
      
      const success = await authService.setupBiometric();
      
      if (success) {
        setBiometricEnabled(true);
        // Refresh user profile to get updated preferences
        const updatedProfile = authService.getUserProfile();
        if (updatedProfile) {
          setUserProfile(updatedProfile);
        }
      }
      
      return success;
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      const credentials = await BiometricAuthService.authenticateWithBiometric();
      
      if (credentials) {
        // Use the stored credentials to sign in
        const { user: authenticatedUser, profile } = await authService.signIn(
          credentials.email, 
          credentials.password
        );
        
        setUser(authenticatedUser);
        setUserProfile(profile);
        return true;
      }
      
      return false;
    } catch (error: any) {
      handleError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disableBiometric = async () => {
    try {
      clearError();
      
      await authService.disableBiometric();
      setBiometricEnabled(false);
      
      // Refresh user profile to get updated preferences
      const updatedProfile = authService.getUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile['profile']>) => {
    try {
      clearError();
      
      await authService.updateProfile(updates);
      
      // Refresh user profile
      const updatedProfile = authService.getUserProfile();
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
      
      // Update local state for biometric preference
      if (updates.biometricEnabled !== undefined) {
        setBiometricEnabled(updates.biometricEnabled);
      }
      
      // Refresh user profile
      const updatedProfile = authService.getUserProfile();
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
      setBiometricEnabled(false);
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
    biometricEnabled,
    biometricType,
    biometricAvailable,
    error,
    register,
    signIn,
    signOut,
    setupBiometric,
    authenticateWithBiometric,
    disableBiometric,
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