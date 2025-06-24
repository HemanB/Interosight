import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User,
  UserCredential,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences: {
    biometricEnabled: boolean;
    notifications: boolean;
    dataCollectionConsent: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  profile: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    medicalConditions?: string[];
    dietaryRestrictions?: string[];
    goals?: string[];
  };
}

// Authentication error types
export interface AuthError {
  code: string;
  message: string;
}

// Authentication service class
class AuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;

  constructor() {
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;
      if (user) {
        await this.loadUserProfile(user.uid);
      } else {
        this.userProfile = null;
      }
    });
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current user profile
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Register new user
  async registerUser(
    email: string, 
    password: string, 
    displayName: string,
    profileData: Partial<UserProfile['profile']> = {}
  ): Promise<{ user: User; profile: UserProfile }> {
    try {
      // Create user account
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        preferences: {
          biometricEnabled: false,
          notifications: true,
          dataCollectionConsent: false,
          theme: 'auto'
        },
        profile: {
          ...profileData
        }
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Load the profile
      this.userProfile = userProfile;

      return { user, profile: userProfile };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User; profile: UserProfile }> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );

      const user = userCredential.user;
      await this.loadUserProfile(user.uid);

      return { user, profile: this.userProfile! };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userProfile = null;
      await AsyncStorage.removeItem('biometricEnabled');
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Setup biometric authentication
  async setupBiometric(): Promise<boolean> {
    try {
      // Check if device supports biometrics
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        throw new Error('Biometric authentication not available on this device');
      }

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel'
      });

      if (result.success) {
        // Update user preferences
        if (this.currentUser && this.userProfile) {
          await updateDoc(doc(db, 'users', this.currentUser.uid), {
            'preferences.biometricEnabled': true,
            updatedAt: serverTimestamp()
          });

          this.userProfile.preferences.biometricEnabled = true;
          await AsyncStorage.setItem('biometricEnabled', 'true');
        }

        return true;
      }

      return false;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Authenticate with biometrics
  async authenticateWithBiometric(): Promise<{ user: User; profile: UserProfile }> {
    try {
      // Check if biometric is enabled
      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
      if (biometricEnabled !== 'true') {
        throw new Error('Biometric authentication not enabled');
      }

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel'
      });

      if (result.success && this.currentUser && this.userProfile) {
        return { user: this.currentUser, profile: this.userProfile };
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Disable biometric authentication
  async disableBiometric(): Promise<void> {
    try {
      if (this.currentUser && this.userProfile) {
        await updateDoc(doc(db, 'users', this.currentUser.uid), {
          'preferences.biometricEnabled': false,
          updatedAt: serverTimestamp()
        });

        this.userProfile.preferences.biometricEnabled = false;
        await AsyncStorage.removeItem('biometricEnabled');
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<UserProfile['profile']>): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      await updateDoc(doc(db, 'users', this.currentUser.uid), {
        profile: updates,
        updatedAt: serverTimestamp()
      });

      if (this.userProfile) {
        this.userProfile.profile = { ...this.userProfile.profile, ...updates };
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Update user preferences
  async updatePreferences(updates: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const preferenceUpdates: any = {};
      Object.keys(updates).forEach(key => {
        preferenceUpdates[`preferences.${key}`] = updates[key as keyof UserProfile['preferences']];
      });

      await updateDoc(doc(db, 'users', this.currentUser.uid), {
        ...preferenceUpdates,
        updatedAt: serverTimestamp()
      });

      if (this.userProfile) {
        this.userProfile.preferences = { ...this.userProfile.preferences, ...updates };
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!this.currentUser || !this.currentUser.email) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        this.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(this.currentUser, credential);

      // Update password
      await updatePassword(this.currentUser, newPassword);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Delete account
  async deleteAccount(password: string): Promise<void> {
    try {
      if (!this.currentUser || !this.currentUser.email) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        this.currentUser.email,
        password
      );
      await reauthenticateWithCredential(this.currentUser, credential);

      // Delete user profile from Firestore
      await deleteDoc(doc(db, 'users', this.currentUser.uid));

      // Delete user account
      await deleteUser(this.currentUser);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Load user profile from Firestore
  private async loadUserProfile(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        this.userProfile = { id: userDoc.id, ...userDoc.data() } as UserProfile;
      } else {
        // Create a default profile if one doesn't exist
        const defaultProfile: UserProfile = {
          uid,
          email: this.currentUser?.email || '',
          displayName: this.currentUser?.displayName || '',
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          preferences: {
            biometricEnabled: false,
            notifications: true,
            dataCollectionConsent: false,
            theme: 'auto'
          },
          profile: {}
        };
        
        await setDoc(doc(db, 'users', uid), defaultProfile);
        this.userProfile = defaultProfile;
      }
    } catch (error: any) {
      console.warn('Error loading user profile:', error);
      
      // Handle offline errors gracefully
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.log('User is offline, using cached profile or creating default');
        
        // Create a minimal profile for offline use
        this.userProfile = {
          uid,
          email: this.currentUser?.email || '',
          displayName: this.currentUser?.displayName || '',
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          preferences: {
            biometricEnabled: false,
            notifications: true,
            dataCollectionConsent: false,
            theme: 'auto'
          },
          profile: {}
        };
      } else {
        // For other errors, re-throw
        throw error;
      }
    }
  }

  // Handle authentication errors
  private handleAuthError(error: any): AuthError {
    let message = 'An unexpected error occurred';
    let code = 'unknown';

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address';
        code = 'user-not-found';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        code = 'wrong-password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists';
        code = 'email-already-in-use';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        code = 'weak-password';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        code = 'invalid-email';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        code = 'too-many-requests';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        code = 'network-error';
        break;
      default:
        message = error.message || message;
        code = error.code || code;
    }

    return { code, message };
  }
}

// Export singleton instance
export const authService = new AuthService(); 