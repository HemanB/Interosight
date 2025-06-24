import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NetworkStatusProps {
  isOnline?: boolean;
  error?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ isOnline = true, error }) => {
  if (isOnline && !error) {
    return null; // Don't show anything when online
  }

  const getMessage = () => {
    if (error?.includes('offline') || error?.includes('client is offline')) {
      return 'Offline mode - Data will sync when connection is restored';
    }
    return error || (isOnline ? "Connected" : "Offline");
  };

  return (
    <View style={styles.container}>
      <Ionicons 
        name={isOnline ? "wifi" : "wifi-outline"} 
        size={16} 
        color={isOnline ? "#10b981" : "#dc2626"} 
      />
      <Text style={[styles.text, { color: isOnline ? "#10b981" : "#dc2626" }]}>
        {getMessage()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
}); 