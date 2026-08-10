import React from "react";
import { View, Pressable, Platform, StyleSheet } from "react-native";
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
import { Text } from "@/components/Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LobbyHeaderProps {
  onBack: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightLabel?: string;
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
        style={[StyleSheet.absoluteFill, { borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }]}
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

/**
 * Labeled Pill Button — used for the solo "Rules" shortcut.
 * Glass pill with a tinted icon chip + label, own press animation + haptics.
 */
const GlassLabelButton = ({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 12, stiffness: 200 });
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
      className="overflow-hidden rounded-full"
    >
      <LinearGradient
        colors={[
          "rgba(129,140,248,0.28)",
          "rgba(99,102,241,0.12)",
          "rgba(255,255,255,0.03)",
        ]}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(129,140,248,0.3)",
          },
        ]}
      />
      <View className="flex-row items-center gap-x-2 py-2 pl-2.5 pr-4">
        <View className="h-8 w-8 items-center justify-center rounded-full border border-indigo-300/25 bg-indigo-500/25">
          <Ionicons name={icon} size={rf(1.8)} color="#C7D2FE" />
        </View>
        <Text
          style={{ fontSize: rf(1.35) }}
          className="font-main-bold uppercase tracking-[1.5px] text-white"
        >
          {label}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

export const LobbyHeader = ({
  onBack,
  rightIcon,
  rightLabel,
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

        {rightLabel && rightIcon ? (
          <GlassLabelButton
            icon={rightIcon}
            label={rightLabel}
            onPress={onRightPress}
          />
        ) : rightIcon ? (
          <GlassButton
            icon={rightIcon as any}
            onPress={onRightPress}
            size={2.4}
          />
        ) : null}
      </View>
    </View>
  );
};
