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
  EmailAuthProvider,
  Auth
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

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences: {
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
  private authInstance: Auth | null = null;

  constructor() {
    // Synchronous initialization for Expo Go / web SDK
    this.authInstance = auth;
    if (this.authInstance) {
      this.authInstance.onAuthStateChanged(async (user: User | null) => {
        this.currentUser = user;
        if (user) {
          await this.loadUserProfile(user.uid);
        } else {
          this.userProfile = null;
        }
      });
    } else {
      console.warn('Firebase Auth not available - running in offline mode');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  // Get current user profile
  async getUserProfile(): Promise<UserProfile | null> {
    return this.userProfile;
  }

  // Check if auth is ready
  private isAuthReady(): boolean {
    return this.authInstance !== null;
  }

  // Register new user
  async registerUser(
    email: string, 
    password: string, 
    displayName: string,
    profileData: Partial<UserProfile['profile']> = {}
  ): Promise<{ user: User; profile: UserProfile }> {
    if (!this.isAuthReady()) {
      throw { code: 'auth-not-ready', message: 'Authentication service is not ready' };
    }

    try {
      // Create user account using web SDK
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        this.authInstance!, 
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
          notifications: true,
          dataCollectionConsent: false,
          theme: 'auto'
        },
        profile: {
          ...profileData
        }
      };

      if (db) {
        await setDoc(doc(db, 'users', user.uid), userProfile);
      }

      // Load the profile
      this.userProfile = userProfile;

      return { user, profile: userProfile };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User; profile: UserProfile }> {
    if (!this.isAuthReady()) {
      throw { code: 'auth-not-ready', message: 'Authentication service is not ready' };
    }

    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.authInstance!, 
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
    if (!this.isAuthReady()) {
      // If auth is not ready, just clear local state
      this.currentUser = null;
      this.userProfile = null;
      return;
    }

    try {
      await signOut(this.authInstance!);
      this.currentUser = null;
      this.userProfile = null;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<UserProfile['profile']>): Promise<void> {
    try {
      if (this.currentUser && this.userProfile && db) {
        await updateDoc(doc(db, 'users', this.currentUser.uid), {
          profile: { ...this.userProfile.profile, ...updates },
          updatedAt: serverTimestamp()
        });

        this.userProfile.profile = { ...this.userProfile.profile, ...updates };
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Update user preferences
  async updatePreferences(updates: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      if (this.currentUser && this.userProfile && db) {
        await updateDoc(doc(db, 'users', this.currentUser.uid), {
          preferences: { ...this.userProfile.preferences, ...updates },
          updatedAt: serverTimestamp()
        });

        this.userProfile.preferences = { ...this.userProfile.preferences, ...updates };
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    if (!this.isAuthReady()) {
      throw { code: 'auth-not-ready', message: 'Authentication service is not ready' };
    }

    try {
      await sendPasswordResetEmail(this.authInstance!, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.isAuthReady() || !this.currentUser) {
      throw { code: 'auth-not-ready', message: 'Authentication service is not ready' };
    }

    try {
      // For web SDK, we need to use EmailAuthProvider.credential
      const credential = EmailAuthProvider.credential(
        this.currentUser.email!,
        currentPassword
      );
      await reauthenticateWithCredential(this.currentUser, credential);
      await updatePassword(this.currentUser, newPassword);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Delete account
  async deleteAccount(password: string): Promise<void> {
    if (!this.isAuthReady() || !this.currentUser) {
      throw { code: 'auth-not-ready', message: 'Authentication service is not ready' };
    }

    try {
      // For web SDK, we need to use EmailAuthProvider.credential
      const credential = EmailAuthProvider.credential(
        this.currentUser.email!,
        password
      );
      await reauthenticateWithCredential(this.currentUser, credential);
      
      if (db) {
        await deleteDoc(doc(db, 'users', this.currentUser.uid));
      }
      
      await deleteUser(this.currentUser);
      this.currentUser = null;
      this.userProfile = null;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Load user profile from Firestore
  private async loadUserProfile(uid: string): Promise<void> {
    try {
      if (!db) {
        console.warn('Firestore not available, cannot load user profile');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        this.userProfile = userDoc.data() as UserProfile;
      } else {
        // Create default profile if it doesn't exist
        const defaultProfile: UserProfile = {
          uid,
          email: this.currentUser?.email || '',
          displayName: this.currentUser?.displayName || '',
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          preferences: {
            notifications: true,
            dataCollectionConsent: false,
            theme: 'auto'
          },
          profile: {}
        };

        await setDoc(doc(db, 'users', uid), defaultProfile);
        this.userProfile = defaultProfile;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Don't throw error, just log it
    }
  }

  // Handle authentication errors
  private handleAuthError(error: any): AuthError {
    if (error.code && error.message) {
      return error;
    } else {
      return { code: 'unknown', message: 'An unexpected error occurred' };
    }
  }
}

// Export singleton instance
export const authService = new AuthService(); 