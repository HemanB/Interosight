import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import AppNavigator from './navigation/AppNavigator';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6366f1" />
    <Text style={styles.loadingText}>Loading InteroSight...</Text>
  </View>
);

function AppContent() {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking authentication state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show main app if user is authenticated
  if (user) {
    return <AppNavigator />;
  }

  // Show login screen if user is not authenticated
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
});