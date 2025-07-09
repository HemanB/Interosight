import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LearnReflectScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'reflect'>('learn');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learn & Reflect</Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === 'learn' ? 'Educational Modules' : 'Guided Reflection'}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'learn' && styles.activeTab]}
          onPress={() => setActiveTab('learn')}
        >
          <Ionicons
            name="school"
            size={20}
            color={activeTab === 'learn' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'learn' && styles.activeTabText]}>
            Learn
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reflect' && styles.activeTab]}
          onPress={() => setActiveTab('reflect')}
        >
          <Ionicons
            name="chatbubble"
            size={20}
            color={activeTab === 'reflect' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'reflect' && styles.activeTabText]}>
            Reflect
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'learn' ? (
          <View style={styles.learnContent}>
            <Text style={styles.sectionTitle}>Your Learning Journey</Text>
            
            {/* Module Progress */}
            <View style={styles.moduleCard}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>Module 0: Recovery Foundations</Text>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressText}>In Progress</Text>
                </View>
              </View>
              <Text style={styles.moduleDescription}>
                Introduction to eating disorders, basic concepts, and recovery principles.
              </Text>
              <View style={styles.moduleProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '60%' }]} />
                </View>
                <Text style={styles.progressLabel}>2 of 3 activities completed</Text>
              </View>
              <TouchableOpacity style={styles.continueButton}>
                <Text style={styles.continueButtonText}>Continue Module</Text>
                <Ionicons name="arrow-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Available Modules */}
            <Text style={styles.sectionTitle}>Available Modules</Text>
            <View style={styles.moduleList}>
              <View style={[styles.moduleItem, styles.lockedModule]}>
                <Ionicons name="lock-closed" size={24} color="#999" />
                <Text style={styles.lockedModuleTitle}>Module 1: Cognitive Restructuring</Text>
                <Text style={styles.lockedModuleSubtitle}>Complete Module 0 to unlock</Text>
              </View>
              
              <View style={[styles.moduleItem, styles.lockedModule]}>
                <Ionicons name="lock-closed" size={24} color="#999" />
                <Text style={styles.lockedModuleTitle}>Module 2: Emotional Regulation</Text>
                <Text style={styles.lockedModuleSubtitle}>Complete Module 1 to unlock</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.reflectContent}>
            <Text style={styles.sectionTitle}>Reflection Sessions</Text>
            
            {/* Quick Start */}
            <TouchableOpacity style={styles.quickStartCard}>
              <View style={styles.quickStartHeader}>
                <Ionicons name="flash" size={24} color="#FF9500" />
                <Text style={styles.quickStartTitle}>Quick Reflection</Text>
              </View>
              <Text style={styles.quickStartDescription}>
                Start a guided reflection session based on your recent experiences.
              </Text>
            </TouchableOpacity>

            {/* Recent Sessions */}
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <View style={styles.sessionList}>
              <View style={styles.sessionItem}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>Why I'm Here</Text>
                  <Text style={styles.sessionDate}>Today</Text>
                </View>
                <Text style={styles.sessionPreview}>
                  "I started this journey because I want to feel better about myself..."
                </Text>
              </View>
              
              <View style={styles.sessionItem}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>Understanding Triggers</Text>
                  <Text style={styles.sessionDate}>Yesterday</Text>
                </View>
                <Text style={styles.sessionPreview}>
                  "I noticed that stress at work often leads to..."
                </Text>
              </View>
            </View>

            {/* New Session */}
            <TouchableOpacity style={styles.newSessionButton}>
              <Ionicons name="add-circle" size={24} color="#007AFF" />
              <Text style={styles.newSessionText}>Start New Reflection</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  learnContent: {
    flex: 1,
  },
  reflectContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    marginTop: 8,
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  progressBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1976d2',
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  moduleProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  moduleList: {
    gap: 12,
  },
  moduleItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockedModule: {
    opacity: 0.6,
  },
  lockedModuleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
  },
  lockedModuleSubtitle: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
  },
  quickStartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  quickStartDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sessionList: {
    gap: 12,
    marginBottom: 20,
  },
  sessionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sessionDate: {
    fontSize: 12,
    color: '#666',
  },
  sessionPreview: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  newSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  newSessionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
});

export default LearnReflectScreen; 