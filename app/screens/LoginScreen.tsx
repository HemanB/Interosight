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
import NetworkStatus from '../components/NetworkStatus';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { 
    signIn, 
    register, 
    error, 
    clearError 
  } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && !displayName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsLoading(true);
    clearError();

    // Add a timeout for slow connections
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        Alert.alert(
          'Slow Connection',
          'This is taking longer than usual. Please check your internet connection.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    }, 10000); // 10 second timeout

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      clearTimeout(timeoutId);
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
          <NetworkStatus />
          
          <View style={styles.header}>
            <ThemedText style={styles.title}>InteroSight</ThemedText>
            <ThemedText style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </ThemedText>
            {error && error.code === 'initialization-error' && (
              <ThemedText style={styles.offlineMessage}>
                Offline mode - Some features may be limited
              </ThemedText>
            )}
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.light.text}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.light.text}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.light.text}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Text>
            </TouchableOpacity>
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
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'
                }
              </Text>
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    alignItems: 'center',
  },
  switchText: {
    color: Colors.light.tint,
    fontSize: 14,
    marginBottom: 15,
  },
  forgotPassword: {
    marginTop: 10,
  },
  forgotPasswordText: {
    color: Colors.light.tint,
    fontSize: 14,
  },
  offlineMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
}); 