import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';

const { width } = Dimensions.get('window');

interface MapNode {
  id: string;
  title: string;
  description: string;
  type: 'reflection' | 'education' | 'activity';
  xpReward: number;
  completed: boolean;
  unlocked: boolean;
  position: { x: number; y: number };
  connections: string[];
  region: string;
}

interface Region {
  id: string;
  name: string;
  description: string;
  color: string;
  vitality: number; // 0-100
  unlocked: boolean;
}

export default function ExploreScreen() {
  const [regions] = useState<Region[]>([
    {
      id: 'body-image',
      name: 'Body Image Grove',
      description: 'Explore your relationship with your body',
      color: '#ec4899',
      vitality: 75,
      unlocked: true,
    },
    {
      id: 'self-worth',
      name: 'Self-Worth Valley',
      description: 'Build confidence and self-compassion',
      color: '#8b5cf6',
      vitality: 60,
      unlocked: true,
    },
    {
      id: 'relationships',
      name: 'Connection Meadows',
      description: 'Navigate relationships and boundaries',
      color: '#06b6d4',
      vitality: 45,
      unlocked: false,
    },
    {
      id: 'emotions',
      name: 'Emotional Springs',
      description: 'Understand and process emotions',
      color: '#f59e0b',
      vitality: 30,
      unlocked: false,
    },
  ]);

  const [nodes] = useState<MapNode[]>([
    {
      id: 'node-1',
      title: 'Body Gratitude',
      description: 'Reflect on what your body does for you',
      type: 'reflection',
      xpReward: 50,
      completed: true,
      unlocked: true,
      position: { x: 50, y: 100 },
      connections: ['node-2'],
      region: 'body-image',
    },
    {
      id: 'node-2',
      title: 'Media Influence',
      description: 'How does media affect your body image?',
      type: 'education',
      xpReward: 40,
      completed: false,
      unlocked: true,
      position: { x: 150, y: 100 },
      connections: ['node-1', 'node-3'],
      region: 'body-image',
    },
    {
      id: 'node-3',
      title: 'Self-Compassion',
      description: 'Practice kindness toward yourself',
      type: 'reflection',
      xpReward: 60,
      completed: false,
      unlocked: true,
      position: { x: 250, y: 100 },
      connections: ['node-2', 'node-4'],
      region: 'self-worth',
    },
    {
      id: 'node-4',
      title: 'Inner Critic',
      description: 'Identify and challenge negative self-talk',
      type: 'activity',
      xpReward: 45,
      completed: false,
      unlocked: false,
      position: { x: 350, y: 100 },
      connections: ['node-3'],
      region: 'self-worth',
    },
  ]);

  const [selectedRegion, setSelectedRegion] = useState<string | null>('body-image');

  const getRegionNodes = (regionId: string) => {
    return nodes.filter(node => node.region === regionId);
  };

  const getNodeIcon = (type: MapNode['type']) => {
    switch (type) {
      case 'reflection':
        return 'chatbubble-ellipses';
      case 'education':
        return 'book';
      case 'activity':
        return 'play-circle';
      default:
        return 'help-circle';
    }
  };

  const getNodeColor = (node: MapNode) => {
    if (node.completed) return '#10b981';
    if (node.unlocked) return '#6366f1';
    return '#9ca3af';
  };

  const handleNodePress = (node: MapNode) => {
    if (!node.unlocked) {
      // Show locked message
      return;
    }
    
    if (node.completed) {
      // Show completion details
      return;
    }

    // Start the activity
    // This would navigate to the specific activity or open a modal
  };

  const selectedRegionData = regions.find(r => r.id === selectedRegion);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood="curious" size={60} />
          <Text style={styles.headerText}>Explore Your Inner World</Text>
          <Text style={styles.subtitleText}>Complete activities to unlock new regions</Text>
        </View>

        {/* Region Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.regionSelector}
          contentContainerStyle={styles.regionSelectorContent}
        >
          {regions.map((region) => (
            <TouchableOpacity
              key={region.id}
              style={[
                styles.regionCard,
                selectedRegion === region.id && styles.selectedRegionCard,
                !region.unlocked && styles.lockedRegionCard
              ]}
              onPress={() => region.unlocked && setSelectedRegion(region.id)}
              disabled={!region.unlocked}
            >
              <View style={[
                styles.regionIcon,
                { backgroundColor: region.color }
              ]}>
                <Ionicons 
                  name={region.unlocked ? 'map' : 'lock-closed'} 
                  size={20} 
                  color="#ffffff" 
                />
              </View>
              <Text style={[
                styles.regionName,
                selectedRegion === region.id && styles.selectedRegionName,
                !region.unlocked && styles.lockedRegionName
              ]}>
                {region.name}
              </Text>
              <View style={styles.vitalityBar}>
                <View 
                  style={[
                    styles.vitalityFill,
                    { 
                      width: `${region.vitality}%`,
                      backgroundColor: region.color 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.vitalityText}>{region.vitality}% vitality</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Map View */}
        {selectedRegionData && (
          <View style={styles.mapSection}>
            <View style={styles.mapHeader}>
              <Text style={styles.mapTitle}>{selectedRegionData.name}</Text>
              <Text style={styles.mapDescription}>{selectedRegionData.description}</Text>
            </View>

            <View style={styles.mapContainer}>
              {getRegionNodes(selectedRegion).map((node) => (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.mapNode,
                    {
                      left: `${node.position.x}%`,
                      top: node.position.y,
                    },
                    node.completed && styles.completedNode,
                    !node.unlocked && styles.lockedNode
                  ]}
                  onPress={() => handleNodePress(node)}
                >
                  <View style={[
                    styles.nodeIcon,
                    { backgroundColor: getNodeColor(node) }
                  ]}>
                    <Ionicons 
                      name={getNodeIcon(node.type)} 
                      size={16} 
                      color="#ffffff" 
                    />
                  </View>
                  <Text style={styles.nodeTitle}>{node.title}</Text>
                  <Text style={styles.nodeXP}>+{node.xpReward} XP</Text>
                  {node.completed && (
                    <View style={styles.completionBadge}>
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Activity List */}
        {selectedRegionData && (
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Available Activities</Text>
            {getRegionNodes(selectedRegion).map((node) => (
              <TouchableOpacity
                key={node.id}
                style={[
                  styles.activityCard,
                  node.completed && styles.completedActivityCard,
                  !node.unlocked && styles.lockedActivityCard
                ]}
                onPress={() => handleNodePress(node)}
                disabled={!node.unlocked}
              >
                <View style={styles.activityHeader}>
                  <View style={[
                    styles.activityIcon,
                    { backgroundColor: getNodeColor(node) }
                  ]}>
                    <Ionicons 
                      name={getNodeIcon(node.type)} 
                      size={20} 
                      color="#ffffff" 
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[
                      styles.activityTitle,
                      node.completed && styles.completedActivityTitle,
                      !node.unlocked && styles.lockedActivityTitle
                    ]}>
                      {node.title}
                    </Text>
                    <Text style={styles.activityDescription}>
                      {node.description}
                    </Text>
                  </View>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityXP}>+{node.xpReward} XP</Text>
                    {node.completed && (
                      <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    )}
                    {!node.unlocked && (
                      <Ionicons name="lock-closed" size={24} color="#9ca3af" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  regionSelector: {
    marginBottom: 20,
  },
  regionSelectorContent: {
    paddingHorizontal: 20,
  },
  regionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedRegionCard: {
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  lockedRegionCard: {
    opacity: 0.6,
  },
  regionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  regionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  selectedRegionName: {
    color: '#6366f1',
  },
  lockedRegionName: {
    color: '#9ca3af',
  },
  vitalityBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 4,
  },
  vitalityFill: {
    height: '100%',
    borderRadius: 2,
  },
  vitalityText: {
    fontSize: 10,
    color: '#6b7280',
  },
  mapSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapHeader: {
    marginBottom: 20,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  mapDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  mapContainer: {
    height: 200,
    position: 'relative',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapNode: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
  },
  completedNode: {
    opacity: 0.7,
  },
  lockedNode: {
    opacity: 0.4,
  },
  nodeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  nodeTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  nodeXP: {
    fontSize: 8,
    color: '#6b7280',
  },
  completionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10b981',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activitySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  completedActivityCard: {
    opacity: 0.7,
  },
  lockedActivityCard: {
    opacity: 0.5,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  completedActivityTitle: {
    color: '#10b981',
  },
  lockedActivityTitle: {
    color: '#9ca3af',
  },
  activityDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  activityXP: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 4,
  },
}); 