import React from "react";
import { View, Pressable, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rf } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LobbyHeaderProps {
  onBack: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  onReportPress?: () => void;
}

/**
 * Advanced Glass Button Component
 * Handles its own animations and haptics internally
 */
const GlassButton = ({
  icon,
  onPress,
  isDanger = false,
  size = 2.4,
}: {
  icon: any;
  onPress?: () => void;
  isDanger?: boolean;
  size?: number;
}) => {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  // Pulse effect for the bug icon background
  React.useEffect(() => {
    if (isDanger) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
    }
  }, [isDanger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: isDanger ? 0.4 : 0,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 200 });
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="h-12 w-12 items-center justify-center overflow-hidden rounded-full"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.02)"]}
        className="absolute inset-0 items-center justify-center rounded-full border border-white/10"
      />

      {/* Background Glow */}
      <Animated.View
        style={isDanger ? pulseStyle : {}}
        className={`absolute h-6 w-6 rounded-full blur-md ${isDanger ? "bg-red-500" : "bg-white/10"}`}
      />

      <Ionicons
        name={icon}
        size={rf(size)}
        color={isDanger ? "#ff4444" : "white"}
        style={{
          textShadowColor: isDanger
            ? "rgba(255,68,68,0.6)"
            : "rgba(255,255,255,0.4)",
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }}
      />
    </AnimatedPressable>
  );
};

export const LobbyHeader = ({
  onBack,
  rightIcon,
  onRightPress,
  onReportPress,
}: LobbyHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 10 }}
      className="flex-row items-center justify-between px-6 pb-4"
    >
      {/* Back Navigation */}
      <GlassButton icon="chevron-back" onPress={onBack} size={2.6} />

      {/* Action Group */}
      <View className="flex-row items-center gap-x-3">
        {onReportPress && (
          <GlassButton
            icon="bug-outline"
            onPress={onReportPress}
            isDanger={true}
            size={2.2}
          />
        )}

        {rightIcon && (
          <GlassButton
            icon={rightIcon as any}
            onPress={onRightPress}
            size={2.4}
          />
        )}
      </View>
    </View>
  );
};
