import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, ImageSourcePropType, TextStyle, ImageStyle, ViewStyle, Easing } from "react-native";

// TypeScript Prop Types for Image and Text Animation Components
interface ImageAnimationProps {
  source: ImageSourcePropType;
  style?: ImageStyle;
}

interface TextAnimationProps {
  children: React.ReactNode;
  style?: TextStyle;
}

// Pulsating Image Component
export const PulsatingImage: React.FC<ImageAnimationProps> = ({ source, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim]);

  return <Animated.Image source={source} style={[style, { transform: [{ scale: scaleAnim }] }]} />;
};

// Rotating Image Component
export const RotatingImage: React.FC<ImageAnimationProps> = ({ source, style }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return <Animated.Image source={source} style={[style, { transform: [{ rotate }] }]} />;
};

// Bouncing Image Component
export const BouncingImage: React.FC<ImageAnimationProps> = ({ source, style }) => {
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateYAnim, { toValue: -10, duration: 300, useNativeDriver: true }),
        Animated.timing(translateYAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  }, [translateYAnim]);

  return <Animated.Image source={source} style={[style, { transform: [{ translateY: translateYAnim }] }]} />;
};

// Fading Text Component
export const FadingText: React.FC<TextAnimationProps> = ({ children, style }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);

  return <Animated.Text style={[style, { opacity: fadeAnim }]}>{children}</Animated.Text>;
};

// Sliding Text Component
export const SlidingText: React.FC<TextAnimationProps> = ({ children, style }) => {
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -50, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [slideAnim]);

  return <Animated.Text style={[style, { transform: [{ translateX: slideAnim }] }]}>{children}</Animated.Text>;
};

// Zoom Image Component
export const ZoomImage: React.FC<ImageAnimationProps> = ({ source, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.5, duration: 500, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim]);

  return <Animated.Image source={source} style={[style, { transform: [{ scale: scaleAnim }] }]} />;
};

// Wobble Text Component
export const WobbleText: React.FC<TextAnimationProps> = ({ children, style }) => {
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ])
    ).start();
  }, [wobbleAnim]);

  return <Animated.Text style={[style, { transform: [{ translateX: wobbleAnim }] }]}>{children}</Animated.Text>;
};

// Function to handle bounce animation on card click
export const bounceAnimation = (animValue: Animated.Value) => {
  return Animated.sequence([
    Animated.spring(animValue, {
      toValue: 1.17,
      friction: 5,
      tension: 160,
      useNativeDriver: true,
    }),
    Animated.spring(animValue, {
      toValue: 1,
      friction: 5,
      tension: 160,
      useNativeDriver: true,
    }),
  ]);
};

// Function to handle flip and bounce animations
export const flipAndBounceStyle = (flipAnim: Animated.Value, bounceAnim: Animated.Value) => ({
  transform: [
    {
      rotateY: flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "14400deg"],
      }),
    },
    {
      scale: bounceAnim,
    },
  ],
});
export const cardAnimation = (animatedValue: Animated.Value) => {
  Animated.sequence([
    Animated.spring(animatedValue, {
      toValue: 1.2, // Scale up to 1.2x size
      friction: 4,  // Lower friction for a bouncier effect
      tension: 100, // Higher tension for a more rigid bounce
      useNativeDriver: true,  // This is important to improve performance
    }),
    Animated.spring(animatedValue, {
      toValue: 1, // Return to original size
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }),
  ]).start();
};