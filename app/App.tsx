import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import AppNavigator from './navigation/AppNavigator';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import NetworkStatus from './components/NetworkStatus';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            The app encountered an error. Please restart the app.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

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
  const { user, isLoading, error } = useAuth();

  // Show error screen if there's an initialization error
  if (error && error.code === 'initialization-error') {
    return <ErrorScreen message={error.message} />;
  }

  // Show loading screen while checking authentication state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show main app if user is authenticated
  if (user) {
    return (
      <ErrorBoundary>
        <NetworkStatus />
        <AppNavigator />
      </ErrorBoundary>
    );
  }

  // Show login screen if user is not authenticated
  return (
    <ErrorBoundary>
      <LoginScreen />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
          <StatusBar style="auto" />
        </AuthProvider>
      </ErrorBoundary>
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