import React, { useEffect } from "react";
import {
  View,
  Image,
  ImageSourcePropType,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import { Text } from "@/components/Text";

// ─── Role data (matches the reveal phase exactly) ───────────────────────────

interface RoleWaitingConfig {
  label: string;
  color: string;
  subtitle: string;
  image: ImageSourcePropType;
}

const ROLE_WAITING_CONFIGS: Record<string, RoleWaitingConfig> = {
  Thief: {
    label: "THE THIEF",
    color: "#EF4444",
    subtitle: "Stay in the shadows. Don't get caught.",
    image: require("@/assets/images/chorsipahi/thief.webp"),
  },
  Advisor: {
    label: "THE ADVISOR",
    color: "#8B5CF6",
    subtitle: "Stay hidden until the thief is caught.",
    image: require("@/assets/images/chorsipahi/advisor.webp"),
  },
  King: {
    label: "THE KING",
    color: "#F59E0B",
    subtitle: "Help police to catch the real thief.",
    image: require("@/assets/images/chorsipahi/king.webp"),
  },
  Police: {
    label: "THE POLICE",
    color: "#3B82F6",
    subtitle: "Justice is in your hands.",
    image: require("@/assets/images/chorsipahi/police.webp"),
  },
};

interface RoleWaitingDrawerProps {
  /** "Thief" | "Advisor" | "King" | "Police". */
  role: string;
  /** Shown while the Police player investigates. */
  message?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SPRING_CONFIG = { damping: 16, stiffness: 120, mass: 0.8 };

// Design is based on a 390pt-wide phone; sizes scale from there (0.85x–1.15x).
function useDrawerScale() {
  const { width } = useWindowDimensions();
  return Math.min(Math.max(width / 390, 0.85), 1.15);
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Half-height waiting drawer shown to Thief/Advisor/King players while the
 * Police investigates. Role icon on the left + a waiting message.
 */
const RoleWaitingDrawer: React.FC<RoleWaitingDrawerProps> = ({
  role,
  message,
}) => {
  const insets = useSafeAreaInsets();
  const scale = useDrawerScale();

  const config = ROLE_WAITING_CONFIGS[role] || ROLE_WAITING_CONFIGS.Thief;

  const slide = useSharedValue(1);
  const bob = useSharedValue(0);

  useEffect(() => {
    slide.value = withDelay(200, withSpring(0, SPRING_CONFIG));
    bob.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slide.value * 300 }],
    opacity: 1 - slide.value,
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -7 * bob.value }],
  }));

  const avatarSize = 90 * scale;
  const fallback =
    message || (role === "Police"
      ? "Catch the Thief and stay away from Joker!"
      : "Waiting for the Police to investigate...");

  return (
    <Animated.View
      pointerEvents="box-none"
      className="absolute left-4 right-4 z-[900]"
      style={[
        { bottom: insets.bottom > 0 ? insets.bottom + 12 : 20 },
        drawerStyle,
      ]}
    >
      <View
        className="w-full overflow-hidden rounded-[32px] border border-white/15 shadow-2xl"
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: Math.round(132 * scale),
          paddingVertical: Math.max(18, 22 * scale),
          paddingHorizontal: Math.max(18, 22 * scale),
        }}
      >
        {/* Frosted glass backdrop */}
        <BlurView
          intensity={45}
          tint="dark"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        {/* Slight dark overlay for contrast */}
        <View className="absolute inset-0 bg-slate-900/50" />

        {/* ── Role icon (left) ── */}
        <Animated.View
          style={[{ width: avatarSize, height: avatarSize }, avatarStyle]}
          className="items-center justify-center"
        >
          {/* Pulsing glow hugging the avatar */}
          <Animated.View
            className="absolute rounded-full"
            style={{
              width: avatarSize + 8,
              height: avatarSize + 8,
              backgroundColor: `${config.color}22`,
            }}
          />
          <Image
            source={config.image}
            style={{ width: avatarSize, height: avatarSize }}
            className="rounded-full border-[3px] border-white/30"
            resizeMode="cover"
          />
        </Animated.View>

        {/* ── Message (right) ── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 400 }}
          className="flex-1"
          style={{ marginLeft: Math.max(20, 26 * scale) }}
        >
          <Text
            style={{ color: config.color, fontSize: 13 * scale, letterSpacing: 2 }}
            className="font-main-bold uppercase"
          >
            {config.label}
          </Text>

          <Text
            className="font-main-bold text-white/90 mt-1.5"
            style={{ fontSize: Math.max(13, 14.5 * scale), lineHeight: Math.round(15 * scale * 1.4) }}
          >
            {fallback}
          </Text>

          <Text
            className="font-main text-white/50 mt-1"
            style={{ fontSize: Math.max(11, 12 * scale) }}
          >
            {config.subtitle}
          </Text>
        </MotiView>
      </View>
    </Animated.View>
  );
};

export default React.memo(RoleWaitingDrawer);
