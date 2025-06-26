import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoggingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log - Meals & Behaviors</Text>
      <Text style={styles.subtitle}>Combined meal and behavior logging interface</Text>
      <Text style={styles.description}>
        This will include:
        - Tab navigation between Meals and Behaviors
        - Meal type selection with pixel art icons
        - Behavior severity slider (1-10 scale)
        - Image input for meals
        - Historical data via calendar
        - Cross-referencing for pattern analysis
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoggingScreen; 