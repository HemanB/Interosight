import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export interface BiometricCredentials {
  email: string;
  password: string;
}

export class BiometricAuthService {
  /**
   * Check if biometric authentication is available on the device
   */
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get the type of biometric authentication available
   */
  static async getBiometricType(): Promise<string> {
    try {
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Touch ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      } else {
        return 'Biometric';
      }
    } catch (error) {
      console.error('Error getting biometric type:', error);
      return 'Biometric';
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  static async enableBiometric(credentials: BiometricCredentials): Promise<boolean> {
    try {
      // First authenticate with biometrics to ensure user is authorized
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      if (authResult.success) {
        // Store credentials securely
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
      return true;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Authenticate using biometrics and return stored credentials
   */
  static async authenticateWithBiometric(): Promise<BiometricCredentials | null> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return null;
      }

      const biometricType = await this.getBiometricType();
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate with ${biometricType} to open InteroSight`,
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        const credentialsJson = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
        if (credentialsJson) {
          return JSON.parse(credentialsJson) as BiometricCredentials;
        }
      }
      return null;
    } catch (error) {
      console.error('Error authenticating with biometric:', error);
      return null;
    }
  }

  /**
   * Get stored credentials without biometric authentication
   * (Useful for checking if credentials exist)
   */
  static async getStoredCredentials(): Promise<BiometricCredentials | null> {
    try {
      const credentialsJson = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
      return credentialsJson ? JSON.parse(credentialsJson) : null;
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return null;
    }
  }
} 