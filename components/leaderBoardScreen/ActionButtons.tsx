import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { winnerstyles } from './buttonStyle';

interface ActionButtonsProps {
  handlePlayAgain: () => void;
  handleBack: () => void;
  handleShare: () => void;
  isButtonDisabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ handlePlayAgain, handleBack, handleShare, isButtonDisabled }) => {
  // Animation refs for each button
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade-in effect
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Scale-up effect
  
  // Start animations when the component is mounted
  useEffect(() => {
    // Sequence of animations: fade-in + scale-up
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={winnerstyles.buttonContainer}>
      {/* Home Button */}
      <Animated.View
        style={{
          opacity: fadeAnim,  // Apply fade effect
          transform: [{ scale: scaleAnim }],  // Apply scale effect
        }}
      >
        <Pressable 
          style={winnerstyles.button} 
          onPress={handleBack} 
          accessibilityLabel="Go to Home"
          accessibilityHint="Navigates back to the home screen"
          disabled={isButtonDisabled} // Disable the button if `isButtonDisabled` is true
        >
          <Text style={winnerstyles.buttonText}>Home</Text>
        </Pressable>
      </Animated.View>
      
      {/* Share Button */}
      <Animated.View
        style={{
          opacity: fadeAnim,  // Apply fade effect
          transform: [{ scale: scaleAnim }],  // Apply scale effect
        }}
      >
        <Pressable 
          style={winnerstyles.button} 
          onPress={handleShare} 
          accessibilityLabel="Share"
          accessibilityHint="Shares your result with others"
        >
          <Text style={winnerstyles.buttonText}>Share</Text>
        </Pressable>
      </Animated.View>
      
      {/* Play Again Button */}
      <Animated.View
        style={{
          opacity: fadeAnim,  // Apply fade effect
          transform: [{ scale: scaleAnim }],  // Apply scale effect
        }}
      >
        <Pressable
          style={winnerstyles.button} 
          onPress={handlePlayAgain} 
          accessibilityLabel="Play Again"
          accessibilityHint="Restarts the game for another round"
          disabled={isButtonDisabled} // Disable the button if `isButtonDisabled` is true
        >
          <Text style={winnerstyles.buttonText}>Play Again</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};
