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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { validateForm } from '../utils/validation';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { 
    login, 
    register, 
    setupBiometric, 
    error, 
    clearError 
  } = useAuth();

  const handleAuth = async () => {
    console.log('LoginScreen: handleAuth called, isLogin:', isLogin);
    
    // Validate form
    const formData = isLogin ? { email, password } : { email, password, displayName };
    const { isValid, errors } = validateForm(formData);
    
    if (!isValid) {
      const errorMessage = Object.values(errors).flat().join('\n');
      console.log('LoginScreen: Validation failed:', errorMessage);
      Alert.alert('Validation Error', errorMessage);
      return;
    }

    console.log('LoginScreen: Form validation passed, starting auth process');
    setIsLoading(true);
    clearError();

    try {
      if (isLogin) {
        console.log('LoginScreen: Attempting login with email:', email);
        await login(email, password);
        console.log('LoginScreen: Login successful');
      } else {
        console.log('LoginScreen: Attempting registration with email:', email);
        await register(email, password, displayName);
        console.log('LoginScreen: Registration successful');
        
        // Offer biometric setup after registration
        Alert.alert(
          'Setup Biometric Login',
          'Would you like to enable biometric authentication for faster login?',
          [
            { text: 'Not Now', style: 'cancel' },
            {
              text: 'Setup',
              onPress: async () => {
                try {
                  await setupBiometric();
                  Alert.alert('Success', 'Biometric authentication enabled!');
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Failed to setup biometric authentication');
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('LoginScreen: Auth error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    Alert.alert('Biometric Not Available', 'Biometric authentication is not available in this demo version.');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setDisplayName('');
    clearError();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>InteroSight</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
            {error && (
              <Text style={styles.errorText}>{error.message}</Text>
            )}
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#64748b"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#64748b" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={toggleMode}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  biometricButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  switchButton: {
    alignItems: 'center',
    padding: 16,
  },
  switchText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
}); 