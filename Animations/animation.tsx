import { Animated, ImageSourcePropType, TextStyle, ImageStyle } from "react-native";

// TypeScript Prop Types for Image and Text Animation Components
interface ImageAnimationProps {
  source: ImageSourcePropType;
  style?: ImageStyle;
}

interface TextAnimationProps {
  children: React.ReactNode;
  style?: TextStyle;
}

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