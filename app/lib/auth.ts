import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple local user interface
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
    emergencyContacts?: any[];
    crisisKeywords?: string[];
    mealLoggingEnabled?: boolean;
    chatHistory?: any[];
    triggerLogs?: any[];
    dbtTools?: any[];
  };
}

// Simple local auth service
class LocalAuthService {
  private currentUser: LocalUser | null = null;

  constructor() {
    console.log('LocalAuthService: Initialized');
    this.loadUserFromStorage();
  }

  private async loadUserFromStorage() {
    try {
      const userData = await AsyncStorage.getItem('localUser');
      if (userData) {
        const user = JSON.parse(userData);
        this.currentUser = {
          ...user,
          createdAt: new Date(user.createdAt),
        };
        console.log('LocalAuthService: User loaded from storage');
      }
    } catch (error) {
      console.error('LocalAuthService: Error loading user:', error);
    }
  }

  private async saveUserToStorage(user: LocalUser) {
    try {
      await AsyncStorage.setItem('localUser', JSON.stringify(user));
    } catch (error) {
      console.error('LocalAuthService: Error saving user:', error);
    }
  }

  getCurrentUser(): LocalUser | null {
    return this.currentUser;
  }

  async registerUser(email: string, password: string, displayName: string): Promise<LocalUser> {
    console.log('LocalAuthService: Registering user:', email);
    
    const user: LocalUser = {
      id: Date.now().toString(),
      email,
      displayName,
      createdAt: new Date(),
      preferences: {
        biometricEnabled: false,
        notifications: true,
        dataCollectionConsent: false,
        theme: 'auto'
      },
      profile: {}
    };

    this.currentUser = user;
    await this.saveUserToStorage(user);
    console.log('LocalAuthService: User registered successfully');
    
    return user;
  }

  async signIn(email: string, password: string): Promise<LocalUser> {
    console.log('LocalAuthService: Signing in user:', email);
    
    // For demo purposes, create a user if none exists
    if (!this.currentUser) {
      return this.registerUser(email, password, email.split('@')[0]);
    }
    
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    console.log('LocalAuthService: Signing out user');
    this.currentUser = null;
    await AsyncStorage.removeItem('localUser');
    console.log('LocalAuthService: User signed out successfully');
  }

  async updateProfile(updates: Partial<LocalUser['profile']>): Promise<void> {
    if (this.currentUser) {
      this.currentUser.profile = { ...this.currentUser.profile, ...updates };
      await this.saveUserToStorage(this.currentUser);
      console.log('LocalAuthService: Profile updated');
    }
  }

  async updatePreferences(updates: Partial<LocalUser['preferences']>): Promise<void> {
    if (this.currentUser) {
      this.currentUser.preferences = { ...this.currentUser.preferences, ...updates };
      await this.saveUserToStorage(this.currentUser);
      console.log('LocalAuthService: Preferences updated');
    }
  }

  async setupBiometric(): Promise<boolean> {
    console.log('LocalAuthService: Biometric setup (mock)');
    if (this.currentUser) {
      this.currentUser.preferences.biometricEnabled = true;
      await this.saveUserToStorage(this.currentUser);
    }
    return true;
  }

  async disableBiometric(): Promise<void> {
    console.log('LocalAuthService: Biometric disabled (mock)');
    if (this.currentUser) {
      this.currentUser.preferences.biometricEnabled = false;
      await this.saveUserToStorage(this.currentUser);
    }
  }

  async resetPassword(email: string): Promise<void> {
    console.log('LocalAuthService: Password reset (mock) for:', email);
    // Mock implementation
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    console.log('LocalAuthService: Password changed (mock)');
    // Mock implementation
  }

  async deleteAccount(password: string): Promise<void> {
    console.log('LocalAuthService: Account deleted (mock)');
    await this.signOut();
  }
}

export const authService = new LocalAuthService(); 