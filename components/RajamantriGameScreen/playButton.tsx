import React, { useRef, useEffect } from "react";
import { Text, Pressable, View, Animated } from "react-native";
import { styles } from "@/screens/RajaMantriGameScreen/styles";

interface PlayButtonProps {
  disabled: boolean;
  onPress: () => void;
  buttonText: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  disabled,
  onPress,
  buttonText,
}) => {
  // Create animated values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Fun bounce animation when pressed
  const handlePressIn = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    onPress();
  };

  // Optional pulsing effect when idle
  useEffect(() => {
    if (!disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [disabled]);

  // Interpolating background color between two shades
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFA500", "#FF4500"], // Colors from orange to red
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.playButton,
          disabled && styles.playButtonDisabled,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor,
          },
        ]}
      >
        <Text style={styles.playButtonText}>{buttonText}</Text>
      </Animated.View>
    </Pressable>
  );
};

export default React.memo(PlayButton);
