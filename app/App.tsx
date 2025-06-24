import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import AppNavigator from './navigation/AppNavigator';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NetworkStatus } from './components/NetworkStatus';

// Suppress Firebase errors that might block interaction
const originalError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && (
    message.includes('Component auth has not been registered yet') ||
    message.includes('AsyncStorage') ||
    message.includes('persistence')
  )) {
    // Suppress Firebase Auth errors that don't affect functionality
    console.warn('Firebase Auth warning (suppressed):', ...args);
    return;
  }
  originalError.apply(console, args);
};

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6366f1" />
    <Text style={styles.loadingText}>Loading InteroSight...</Text>
    <Text style={styles.loadingSubtext}>Please check your internet connection</Text>
  </View>
);

// Error Screen Component
const ErrorScreen = ({ message }: { message: string }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Connection Issue</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    <Text style={styles.errorSubtext}>
      Please check your internet connection and try again.
    </Text>
  </View>
);

function AppContent() {
  const { user, biometricEnabled, authenticateWithBiometric, isLoading, error } = useAuth();
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricChecked, setBiometricChecked] = useState(false);

  useEffect(() => {
    const checkBiometricAuth = async () => {
      if (user && biometricEnabled && !biometricChecked) {
        try {
          // Check if biometric is available
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          
          if (hasHardware && isEnrolled) {
            setShowBiometricPrompt(true);
          }
        } catch (error) {
          console.error('Error checking biometric availability:', error);
        } finally {
          setBiometricChecked(true);
        }
      } else {
        setBiometricChecked(true);
      }
    };

    checkBiometricAuth();
  }, [user, biometricEnabled, biometricChecked]);

  const handleBiometricAuth = async () => {
    try {
      await authenticateWithBiometric();
      setShowBiometricPrompt(false);
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      setShowBiometricPrompt(false);
    }
  };

  // Show error screen if there's an initialization error
  if (error && error.code === 'initialization-error') {
    return <ErrorScreen message={error.message} />;
  }

  // Show loading screen while checking authentication state
  if (isLoading || !biometricChecked) {
    return <LoadingScreen />;
  }

  // Show biometric prompt if user is logged in and biometric is enabled
  if (showBiometricPrompt) {
    return (
      <LoginScreen />
    );
  }

  // Show main app if user is authenticated
  if (user) {
    return (
      <>
        <NetworkStatus isOnline={!error} error={error?.message} />
        <AppNavigator />
      </>
    );
  }

  // Show login screen if user is not authenticated (including when Firebase Auth is not available)
  return <LoginScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});