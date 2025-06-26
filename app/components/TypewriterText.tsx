import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: any;
  showCursor?: boolean;
  delay?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  onComplete,
  style,
  showCursor = true,
  delay = 0,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Cursor blink animation
  useEffect(() => {
    if (showCursor && isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      cursorOpacity.setValue(1);
    }
  }, [showCursor, isTyping, cursorOpacity]);

  // Typewriter effect
  useEffect(() => {
    if (!text) return;

    const startTyping = () => {
      setIsTyping(true);
      setDisplayedText('');
      setCurrentIndex(0);
    };

    const timer = setTimeout(startTyping, delay);

    return () => clearTimeout(timer);
  }, [text, delay]);

  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) {
      if (isTyping) {
        setIsTyping(false);
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, isTyping, onComplete]);

  // Handle text changes
  useEffect(() => {
    if (text !== displayedText && !isTyping) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(true);
    }
  }, [text]);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, style]}>
        {displayedText}
        {showCursor && (
          <Animated.Text
            style={[
              styles.cursor,
              {
                opacity: cursorOpacity,
              },
            ]}
          >
            |
          </Animated.Text>
        )}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  text: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    textAlign: 'left',
  },
  cursor: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
}); 