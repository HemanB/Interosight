import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { llmService } from '../lib/llm';

interface NetworkStatusProps {
  isVisible?: boolean;
}

export default function NetworkStatus({ isVisible = true }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [llmHealth, setLlmHealth] = useState({
    isHealthy: true,
    errorCount: 0,
    queueLength: 0,
    cacheSize: 0,
    lastErrorTime: 0
  });

  useEffect(() => {
    const checkNetworkStatus = () => {
      // Check basic network connectivity
      fetch('https://www.google.com', { mode: 'no-cors' })
        .then(() => setIsOnline(true))
        .catch(() => setIsOnline(false));
    };

    const checkLLMHealth = () => {
      const health = llmService.getHealthStatus();
      setLlmHealth(health);
    };

    // Initial checks
    checkNetworkStatus();
    checkLLMHealth();

    // Set up intervals
    const networkInterval = setInterval(checkNetworkStatus, 30000); // Every 30 seconds
    const llmInterval = setInterval(checkLLMHealth, 10000); // Every 10 seconds

    return () => {
      clearInterval(networkInterval);
      clearInterval(llmInterval);
    };
  }, []);

  if (!isVisible) return null;

  const getStatusColor = () => {
    if (!isOnline) return '#ef4444'; // Red for offline
    if (!llmHealth.isHealthy) return '#f59e0b'; // Orange for unhealthy LLM
    if (llmHealth.queueLength > 10) return '#3b82f6'; // Blue for high queue
    return '#10b981'; // Green for healthy
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!llmHealth.isHealthy) return 'Service Unhealthy';
    if (llmHealth.queueLength > 10) return 'High Load';
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return 'cloud-offline';
    if (!llmHealth.isHealthy) return 'warning';
    if (llmHealth.queueLength > 10) return 'time';
    return 'checkmark-circle';
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Ionicons name={getStatusIcon() as any} size={16} color="white" />
      <Text style={styles.text}>{getStatusText()}</Text>
      
      {/* Show queue length if high */}
      {llmHealth.queueLength > 0 && (
        <Text style={styles.queueText}>Queue: {llmHealth.queueLength}</Text>
      )}
      
      {/* Show error count if any */}
      {llmHealth.errorCount > 0 && (
        <Text style={styles.errorText}>Errors: {llmHealth.errorCount}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  queueText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 8,
    opacity: 0.9,
  },
  errorText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 8,
    opacity: 0.9,
  },
}); 