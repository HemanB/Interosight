import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MascotProps {
  mood: 'happy' | 'concerned' | 'thinking' | 'supportive' | 'celebrating';
  size?: number;
  isAnimating?: boolean;
  style?: any;
}

const { width } = Dimensions.get('window');

export default function Mascot({ 
  mood, 
  size = 80, 
  isAnimating = true, 
  style 
}: MascotProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isAnimating) return;

    // Bounce animation
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation for thinking
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotate animation for celebrating
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    bounce.start();

    if (mood === 'thinking') {
      pulse.start();
    } else if (mood === 'celebrating') {
      rotate.start();
    }

    return () => {
      bounce.stop();
      pulse.stop();
      rotate.stop();
    };
  }, [mood, isAnimating]);

  const getMascotIcon = () => {
    switch (mood) {
      case 'happy':
        return 'happy-outline';
      case 'concerned':
        return 'sad-outline';
      case 'thinking':
        return 'bulb-outline';
      case 'supportive':
        return 'heart-outline';
      case 'celebrating':
        return 'star-outline';
      default:
        return 'happy-outline';
    }
  };

  const getMascotColor = () => {
    switch (mood) {
      case 'happy':
        return '#10b981';
      case 'concerned':
        return '#f59e0b';
      case 'thinking':
        return '#6366f1';
      case 'supportive':
        return '#ec4899';
      case 'celebrating':
        return '#f97316';
      default:
        return '#6366f1';
    }
  };

  const bounceInterpolate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.mascotContainer,
          {
            width: size,
            height: size,
            transform: [
              { translateY: bounceInterpolate },
              { scale: pulseAnim },
              { rotate: mood === 'celebrating' ? rotateInterpolate : '0deg' },
            ],
          },
        ]}
      >
        <View style={[styles.mascot, { backgroundColor: getMascotColor() }]}>
          <Ionicons
            name={getMascotIcon() as any}
            size={size * 0.5}
            color="#ffffff"
          />
        </View>
        
        {/* Glasses for the mascot */}
        <View style={styles.glasses}>
          <View style={styles.lens} />
          <View style={styles.bridge} />
          <View style={styles.lens} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glasses: {
    position: 'absolute',
    top: '25%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  lens: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  bridge: {
    width: 8,
    height: 2,
    backgroundColor: '#ffffff',
    marginHorizontal: 2,
  },
}); 