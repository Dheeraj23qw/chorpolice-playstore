import React from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rf } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LobbyHeaderProps {
  onBack: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export const LobbyHeader = ({ onBack, rightIcon, onRightPress }: LobbyHeaderProps) => {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const rightScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
  }));

  return (
    <View style={{ paddingTop: insets.top + 10 }} className="flex-row items-center justify-between px-6 pb-4">
      <AnimatedPressable
        onPress={onBack}
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={animatedStyle}
        className="overflow-hidden rounded-full"
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
          className="h-12 w-12 items-center justify-center rounded-full border border-white/10"
        >
          <View className="absolute h-6 w-6 rounded-full bg-white/10 blur-md" />
          <Ionicons
            name="chevron-back"
            size={rf(2.6)}
            color="white"
            style={{
              textShadowColor: "rgba(255,255,255,0.8)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
            }}
          />
        </LinearGradient>
      </AnimatedPressable>

      {rightIcon && (
        <AnimatedPressable
          onPress={onRightPress}
          onPressIn={() => (rightScale.value = withSpring(0.9))}
          onPressOut={() => (rightScale.value = withSpring(1))}
          style={rightAnimatedStyle}
          className="overflow-hidden rounded-full"
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
            className="h-12 w-12 items-center justify-center rounded-full border border-white/10"
          >
            <View className="absolute h-6 w-6 rounded-full bg-white/10 blur-md" />
            <Ionicons
              name={rightIcon as any}
              size={rf(2.4)}
              color="white"
              style={{
                textShadowColor: "rgba(255,255,255,0.8)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              }}
            />
          </LinearGradient>
        </AnimatedPressable>
      )}
    </View>
  );
};
