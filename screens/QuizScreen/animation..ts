import { Animated } from 'react-native';

export const createAnimation = (
  value: Animated.Value,
  duration: number = 1500
) => {
  return {
    opacity: value,
    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1], // Scale effect
        }),
      },
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0], // Slide up effect
        }),
      },
    ],
    duration,
  };
};

// Function to start the animation
export const animateComponent = (animationValue: Animated.Value, duration: number = 1500) => {
  return Animated.timing(animationValue, {
    toValue: 1,
    duration: duration,
    useNativeDriver: true,
  });
};
