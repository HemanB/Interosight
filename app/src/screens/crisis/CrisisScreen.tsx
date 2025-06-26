import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CrisisScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crisis Tools</Text>
      <Text style={styles.subtitle}>Emergency resources and crisis support</Text>
      <Text style={styles.description}>
        This will include:
        - Emergency contacts with one-tap calling
        - Crisis hotlines and suicide prevention
        - DBT tools and grounding exercises
        - Safety planning features
        - Professional resources and therapist finder
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

export default CrisisScreen; 