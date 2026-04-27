import React, { useMemo, useEffect } from "react";
import { View, Image, Platform, StyleSheet } from "react-native";
import { Text } from "@/components/Text";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { wp, hp } from "@/utils/responsive";

import { loadUsername } from "@/storage/userStorage";

// --- Types & Constants ---
interface RoleConfig {
  color: string;
  subtitle: string;
  label: string;
}

interface Props {
  role: "King" | "Thief" | "Advisor" | "Police";
  round: number;
}

const ROLE_ASSETS: Record<string, any> = {
  King: require("@/assets/images/chorsipahi/king.webp"),
  Advisor: require("@/assets/images/chorsipahi/advisor.webp"),
  Thief: require("@/assets/images/chorsipahi/thief.webp"),
  Police: require("@/assets/images/chorsipahi/police.webp"),
};

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  Thief: {
    color: "#EF4444",
    subtitle: "Stay in the shadows. Don't get caught.",
    label: "THE THIEF",
  },
  Advisor: {
    color: "#8B5CF6",
    subtitle: "Stay hidden until the thief is caught.",
    label: "THE ADVISOR",
  },
  King: {
    color: "#F59E0B",
    subtitle: "Help police to catch the real thief.",
    label: "THE KING",
  },
  Police: {
    color: "#3B82F6",
    subtitle: "Justice is in your hands.",
    label: "THE POLICE",
  },
};

export const RoleRevealView: React.FC<Props> = React.memo(({ role, round }) => {
  const playerName = loadUsername() || "PLAYER";

  // Memoize configs to prevent re-instantiation
  const config = useMemo(
    () => ROLE_CONFIGS[role] || ROLE_CONFIGS.Thief,
    [role],
  );
  const image = useMemo(() => ROLE_ASSETS[role] || ROLE_ASSETS.Thief, [role]);

  // Float animation: Using linear timing for performance consistency
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, []);

  const floatStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: float.value }],
    }),
    [],
  );

  return (
    <View
      style={styles.container}
      // Performance optimization for Android
      renderToHardwareTextureAndroid={Platform.OS === "android"}
      // Performance optimization for iOS
      shouldRasterizeIOS={Platform.OS === "ios"}
    >
      {/* Round Badge */}
      <Animated.View entering={FadeIn.duration(800)}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ROUND {round}</Text>
        </View>
      </Animated.View>

      {/* Role Title */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)}>
        <Text style={[styles.title, { color: config.color }]}>
          {config.label}
        </Text>
      </Animated.View>

      {/* Optimized Floating Image */}
      <Animated.View style={[styles.imageContainer, floatStyle]}>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </Animated.View>

      {/* Glassmorphism Card */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(600)}
        style={styles.card}
      >
        <Text style={styles.playerName}>{playerName}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>
      </Animated.View>
    </View>
  );
});

// Production-grade styles: Separated to reduce render cycles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050508",
  },
  badge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 40,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 4,
    color: "rgba(255,255,255,0.5)",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  imageContainer: {
    marginVertical: 40,
  },
  image: {
    width: wp(75),
    height: hp(35),
  },
  card: {
    width: "80%",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 24,
  },
  playerName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6366f1",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 8,
  },
});
