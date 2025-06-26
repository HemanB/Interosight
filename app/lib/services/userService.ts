import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalUser } from '../auth';

export interface UserProfile {
  recoveryStreak?: number;
  totalXP?: number;
  emergencyContacts?: EmergencyContact[];
  crisisKeywords?: string[];
  mealLoggingEnabled?: boolean;
  chatHistory?: ChatMessage[];
  dbtTools?: DBTTool[];
}

export interface EmergencyContact {
  id: string;
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

export interface DBTTool {
  id: string;
  name: string;
  description: string;
  category: 'distress-tolerance' | 'mindfulness' | 'emotion-regulation' | 'interpersonal-effectiveness';
  lastUsed?: Date;
  effectiveness?: number;
}

export interface UserStats {
  totalMeals: number;
  totalTriggers: number;
  recoveryStreak: number;
  totalXP: number;
  lastActiveDate: Date;
}

// User service class
export class UserService {
  private readonly USER_STORAGE_KEY = 'userProfile';
  private readonly PREFERENCES_STORAGE_KEY = 'userPreferences';

  // Profile operations
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const storedProfile = await AsyncStorage.getItem(`${this.USER_STORAGE_KEY}_${userId}`);
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        // Convert date strings back to Date objects
        if (profile.chatHistory) {
          profile.chatHistory = profile.chatHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        }
        if (profile.dbtTools) {
          profile.dbtTools = profile.dbtTools.map((tool: any) => ({
            ...tool,
            lastUsed: tool.lastUsed ? new Date(tool.lastUsed) : undefined
          }));
        }
        return profile;
      }
      return {};
    } catch (error) {
      console.error('UserService: Error getting user profile:', error);
      throw new Error('Failed to load user profile');
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const currentProfile = await this.getUserProfile(userId);
      const updatedProfile = { ...currentProfile, ...updates };
      
      await AsyncStorage.setItem(`${this.USER_STORAGE_KEY}_${userId}`, JSON.stringify(updatedProfile));
      
      console.log('UserService: User profile updated successfully');
      return updatedProfile;
    } catch (error) {
      console.error('UserService: Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Emergency contacts operations
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile.emergencyContacts || [];
    } catch (error) {
      console.error('UserService: Error getting emergency contacts:', error);
      throw new Error('Failed to load emergency contacts');
    }
  }

  async addEmergencyContact(userId: string, contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    try {
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        ...contact
      };

      const currentContacts = await this.getEmergencyContacts(userId);
      const updatedContacts = [...currentContacts, newContact];
      
      await this.updateUserProfile(userId, { emergencyContacts: updatedContacts });
      
      console.log('UserService: Emergency contact added successfully');
      return newContact;
    } catch (error) {
      console.error('UserService: Error adding emergency contact:', error);
      throw new Error('Failed to add emergency contact');
    }
  }

  async updateEmergencyContact(userId: string, contactId: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact> {
    try {
      const currentContacts = await this.getEmergencyContacts(userId);
      const contactIndex = currentContacts.findIndex(contact => contact.id === contactId);
      
      if (contactIndex === -1) {
        throw new Error('Emergency contact not found');
      }

      const updatedContact = { ...currentContacts[contactIndex], ...updates };
      const updatedContacts = [...currentContacts];
      updatedContacts[contactIndex] = updatedContact;
      
      await this.updateUserProfile(userId, { emergencyContacts: updatedContacts });
      
      console.log('UserService: Emergency contact updated successfully');
      return updatedContact;
    } catch (error) {
      console.error('UserService: Error updating emergency contact:', error);
      throw new Error('Failed to update emergency contact');
    }
  }

  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    try {
      const currentContacts = await this.getEmergencyContacts(userId);
      const updatedContacts = currentContacts.filter(contact => contact.id !== contactId);
      
      await this.updateUserProfile(userId, { emergencyContacts: updatedContacts });
      
      console.log('UserService: Emergency contact deleted successfully');
    } catch (error) {
      console.error('UserService: Error deleting emergency contact:', error);
      throw new Error('Failed to delete emergency contact');
    }
  }

  // Chat history operations
  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const profile = await this.getUserProfile(userId);
      const chatHistory = profile.chatHistory || [];
      return chatHistory.slice(-limit);
    } catch (error) {
      console.error('UserService: Error getting chat history:', error);
      throw new Error('Failed to load chat history');
    }
  }

  async addChatMessage(userId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    try {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        timestamp: new Date(),
        ...message
      };

      const currentHistory = await this.getChatHistory(userId, 1000);
      const updatedHistory = [...currentHistory, newMessage];
      
      await this.updateUserProfile(userId, { chatHistory: updatedHistory });
      
      console.log('UserService: Chat message added successfully');
      return newMessage;
    } catch (error) {
      console.error('UserService: Error adding chat message:', error);
      throw new Error('Failed to add chat message');
    }
  }

  async clearChatHistory(userId: string): Promise<void> {
    try {
      await this.updateUserProfile(userId, { chatHistory: [] });
      console.log('UserService: Chat history cleared successfully');
    } catch (error) {
      console.error('UserService: Error clearing chat history:', error);
      throw new Error('Failed to clear chat history');
    }
  }

  // DBT tools operations
  async getDBTTools(userId: string): Promise<DBTTool[]> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile.dbtTools || [];
    } catch (error) {
      console.error('UserService: Error getting DBT tools:', error);
      throw new Error('Failed to load DBT tools');
    }
  }

  async addDBTTool(userId: string, tool: Omit<DBTTool, 'id'>): Promise<DBTTool> {
    try {
      const newTool: DBTTool = {
        id: Date.now().toString(),
        ...tool
      };

      const currentTools = await this.getDBTTools(userId);
      const updatedTools = [...currentTools, newTool];
      
      await this.updateUserProfile(userId, { dbtTools: updatedTools });
      
      console.log('UserService: DBT tool added successfully');
      return newTool;
    } catch (error) {
      console.error('UserService: Error adding DBT tool:', error);
      throw new Error('Failed to add DBT tool');
    }
  }

  async updateDBTTool(userId: string, toolId: string, updates: Partial<DBTTool>): Promise<DBTTool> {
    try {
      const currentTools = await this.getDBTTools(userId);
      const toolIndex = currentTools.findIndex(tool => tool.id === toolId);
      
      if (toolIndex === -1) {
        throw new Error('DBT tool not found');
      }

      const updatedTool = { ...currentTools[toolIndex], ...updates };
      const updatedTools = [...currentTools];
      updatedTools[toolIndex] = updatedTool;
      
      await this.updateUserProfile(userId, { dbtTools: updatedTools });
      
      console.log('UserService: DBT tool updated successfully');
      return updatedTool;
    } catch (error) {
      console.error('UserService: Error updating DBT tool:', error);
      throw new Error('Failed to update DBT tool');
    }
  }

  async deleteDBTTool(userId: string, toolId: string): Promise<void> {
    try {
      const currentTools = await this.getDBTTools(userId);
      const updatedTools = currentTools.filter(tool => tool.id !== toolId);
      
      await this.updateUserProfile(userId, { dbtTools: updatedTools });
      
      console.log('UserService: DBT tool deleted successfully');
    } catch (error) {
      console.error('UserService: Error deleting DBT tool:', error);
      throw new Error('Failed to delete DBT tool');
    }
  }

  // Stats and analytics
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const profile = await this.getUserProfile(userId);
      
      return {
        totalMeals: 0, // This would be calculated from meal service
        totalTriggers: 0, // This would be calculated from meal service
        recoveryStreak: profile.recoveryStreak || 0,
        totalXP: profile.totalXP || 0,
        lastActiveDate: new Date()
      };
    } catch (error) {
      console.error('UserService: Error getting user stats:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  // Data management
  async clearAllUserData(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.USER_STORAGE_KEY}_${userId}`);
      await AsyncStorage.removeItem(`${this.PREFERENCES_STORAGE_KEY}_${userId}`);
      console.log('UserService: All user data cleared');
    } catch (error) {
      console.error('UserService: Error clearing user data:', error);
      throw new Error('Failed to clear user data');
    }
  }
}

// Export singleton instance
export const userService = new UserService(); 