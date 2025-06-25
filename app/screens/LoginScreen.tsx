import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NetworkStatus } from '../components/NetworkStatus';
import Mascot from '../components/Mascot';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { 
    signIn, 
    register, 
    setupBiometric, 
    authenticateWithBiometric, 
    biometricEnabled, 
    error, 
    clearError 
  } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Welcome to Intero', 'Please fill in all fields to begin your journey');
      return;
    }

    if (!isLogin && !displayName) {
      Alert.alert('Welcome to Intero', 'Please enter your name to create your character');
      return;
    }

    setIsLoading(true);
    clearError();

    // Add a timeout for slow connections
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        Alert.alert(
          'Connection Slow',
          'The Stone of Wisdom is taking longer to respond. Please check your connection.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    }, 10000); // 10 second timeout

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await register(email, password, displayName);
        
        // After successful registration, offer biometric setup
        Alert.alert(
          'Enable Biometric Access',
          'Would you like to enable biometric authentication for faster access to your inner world?',
          [
            {
              text: 'Not Now',
              style: 'cancel',
            },
            {
              text: 'Enable',
              onPress: async () => {
                try {
                  const success = await setupBiometric();
                  if (success) {
                    Alert.alert('Success', 'Biometric authentication enabled! Your journey awaits.');
                  }
                } catch (error: any) {
                  Alert.alert('Setup Incomplete', error.message || 'Biometric setup failed, but you can still access Intero');
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Journey Paused', error.message || 'Unable to continue. Please try again.');
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricEnabled) {
      Alert.alert('Biometric Not Enabled', 'Please enable biometric authentication in settings first.');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await authenticateWithBiometric();
    } catch (error: any) {
      Alert.alert('Biometric Error', error.message || 'Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() && password.trim() && (isLogin || displayName.trim());

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Network Status */}
          <NetworkStatus isOnline={!error} error={error?.message} />
          
          <View style={styles.header}>
            <Mascot mood="happy" size={80} />
            <ThemedText style={styles.title}>Intero</ThemedText>
            <ThemedText style={styles.subtitle}>
              {isLogin ? 'Welcome back, wanderer' : 'Begin your journey of self-discovery'}
            </ThemedText>
            <ThemedText style={styles.tagline}>
              A reflective RPG for inner wisdom
            </ThemedText>
            {error && error.code === 'initialization-error' && (
              <ThemedText style={styles.offlineMessage}>
                Offline mode - Your journey continues locally
              </ThemedText>
            )}
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your Character Name"
                  placeholderTextColor="#9ca3af"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#6366f1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#6366f1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#9ca3af" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, !isFormValid && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={isLoading || !isFormValid}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Opening Portal...' : (isLogin ? 'Enter Inner World' : 'Begin Journey')}
              </Text>
            </TouchableOpacity>

            {isLogin && biometricEnabled && (
              <TouchableOpacity
                style={[styles.biometricButton, isLoading && styles.buttonDisabled]}
                onPress={handleBiometricAuth}
                disabled={isLoading}
              >
                <Ionicons name="finger-print" size={20} color="#6366f1" />
                <Text style={styles.biometricButtonText}>
                  Quick Access with Biometrics
                </Text>
              </TouchableOpacity>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color="#dc2626" />
                <Text style={styles.errorText}>{error.message}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setDisplayName('');
                clearError();
              }}
            >
              <Text style={styles.switchText}>
                {isLogin 
                  ? "New to Intero? Create your character" 
                  : 'Already have a character? Sign in'
                }
              </Text>
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Intero is designed to support your recovery journey, not replace professional care.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  offlineMessage: {
    fontSize: 12,
    color: '#fbbf24',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  passwordToggle: {
    padding: 8,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  biometricButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  switchText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  forgotPassword: {
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#6366f1',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  disclaimerText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
}); 