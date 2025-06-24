import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { BiometricAuthService } from '../lib/biometrics';

export default function BiometricAuthScreen() {
  const { authenticateWithBiometric, biometricType, biometricAvailable } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Automatically attempt biometric authentication when screen loads
    if (biometricAvailable) {
      handleBiometricAuth();
    }
  }, [biometricAvailable]);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    try {
      const success = await authenticateWithBiometric();
      if (!success) {
        setShowFallback(true);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setShowFallback(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFallbackAuth = () => {
    Alert.alert(
      'Manual Authentication',
      'Please sign in with your email and password.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to login screen or show login form
            // For now, we'll just show an alert
            Alert.alert('Login Required', 'Please implement your login screen here.');
          },
        },
      ]
    );
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'Face ID':
        return 'scan-outline';
      case 'Touch ID':
        return 'finger-print-outline';
      case 'Iris':
        return 'eye-outline';
      default:
        return 'shield-checkmark-outline';
    }
  };

  if (!biometricAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="warning-outline" size={80} color="#f59e0b" />
          <Text style={styles.title}>Biometric Authentication Not Available</Text>
          <Text style={styles.subtitle}>
            Your device doesn't support biometric authentication or it's not set up.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleFallbackAuth}>
            <Text style={styles.buttonText}>Continue with Password</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name={getBiometricIcon()} 
          size={100} 
          color={isAuthenticating ? '#6366f1' : '#10b981'} 
        />
        
        <Text style={styles.title}>Welcome to InteroSight</Text>
        <Text style={styles.subtitle}>
          Authenticate with {biometricType} to continue
        </Text>

        {isAuthenticating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Authenticating...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.button, showFallback && styles.fallbackButton]} 
            onPress={showFallback ? handleFallbackAuth : handleBiometricAuth}
          >
            <Ionicons 
              name={showFallback ? 'key-outline' : getBiometricIcon()} 
              size={24} 
              color="#ffffff" 
            />
            <Text style={styles.buttonText}>
              {showFallback ? 'Use Password Instead' : `Authenticate with ${biometricType}`}
            </Text>
          </TouchableOpacity>
        )}

        {showFallback && (
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleBiometricAuth}
          >
            <Text style={styles.secondaryButtonText}>Try {biometricType} Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  button: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fallbackButton: {
    backgroundColor: '#f59e0b',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
}); 