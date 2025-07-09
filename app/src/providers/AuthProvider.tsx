import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { authService } from '../services/auth/auth.service';
import { AuthState, User, LoginCredentials, SignupCredentials } from '../core/types/auth.types';

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignupCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const user = authService.getCurrentUser();
          setState({
            user,
            loading: false,
            error: null,
          });
        } catch (error: any) {
          setState({
            user: null,
            loading: false,
            error: error.message,
          });
        }
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authService.signIn(credentials.email, credentials.password);
      setState({
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const signUp = async (credentials: SignupCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authService.signUp(credentials.email, credentials.password);
      setState({
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await authService.signOut();
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
      }));
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(updates);
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
      }));
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 