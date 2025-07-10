import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import LoggingScreen from '../screens/logging/LoggingScreen';
import ResourcesScreen from '../screens/resources/ResourcesScreen';
import ConnectScreen from '../screens/connect/ConnectScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Logging') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Resources') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Connect') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Logging" 
        component={LoggingScreen}
        options={{ tabBarLabel: 'Logging' }}
      />
      <Tab.Screen 
        name="Resources" 
        component={ResourcesScreen}
        options={{ tabBarLabel: 'Resources' }}
      />
      <Tab.Screen 
        name="Connect" 
        component={ConnectScreen}
        options={{ tabBarLabel: 'Connect' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}; 