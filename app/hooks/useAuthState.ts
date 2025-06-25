import { useState, useEffect, useCallback } from 'react';
import { authService } from '../lib/auth';
import { LocalUser, AuthError, LoginCredentials, RegisterCredentials, PasswordChangeData } from '../types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Check initial auth state
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error checking auth state:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Check immediately
    checkAuthState();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await authService.signIn(credentials.email, credentials.password);
      setUser(user);
      return { user, profile: user };
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Login failed'
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await authService.registerUser(
        credentials.email, 
        credentials.password, 
        credentials.displayName
      );
      setUser(user);
      return { user, profile: user };
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Registration failed'
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.signOut();
      setUser(null);
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Logout failed'
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (updates: Partial<LocalUser['profile']>) => {
    setError(null);
    
    try {
      await authService.updateProfile(updates);
      if (user) {
        setUser({ ...user, profile: { ...user.profile, ...updates } });
      }
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Profile update failed'
      };
      setError(authError);
      throw authError;
    }
  }, [user]);

  // Update preferences function
  const updatePreferences = useCallback(async (updates: Partial<LocalUser['preferences']>) => {
    setError(null);
    
    try {
      await authService.updatePreferences(updates);
      if (user) {
        setUser({ ...user, preferences: { ...user.preferences, ...updates } });
      }
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Preferences update failed'
      };
      setError(authError);
      throw authError;
    }
  }, [user]);

  // Setup biometric function
  const setupBiometric = useCallback(async () => {
    setError(null);
    
    try {
      const success = await authService.setupBiometric();
      if (success && user) {
        setUser({ ...user, preferences: { ...user.preferences, biometricEnabled: true } });
      }
      return success;
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Biometric setup failed'
      };
      setError(authError);
      throw authError;
    }
  }, [user]);

  // Disable biometric function
  const disableBiometric = useCallback(async () => {
    setError(null);
    
    try {
      await authService.disableBiometric();
      if (user) {
        setUser({ ...user, preferences: { ...user.preferences, biometricEnabled: false } });
      }
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Biometric disable failed'
      };
      setError(authError);
      throw authError;
    }
  }, [user]);

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    
    try {
      await authService.resetPassword(email);
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Password reset failed'
      };
      setError(authError);
      throw authError;
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (passwordData: PasswordChangeData) => {
    setError(null);
    
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Password change failed'
      };
      setError(authError);
      throw authError;
    }
  }, []);

  // Delete account function
  const deleteAccount = useCallback(async (password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.deleteAccount(password);
      setUser(null);
    } catch (err: any) {
      const authError: AuthError = {
        code: err.code || 'unknown',
        message: err.message || 'Account deletion failed'
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    setupBiometric,
    disableBiometric,
    resetPassword,
    changePassword,
    deleteAccount,
    clearError
  };
}; 