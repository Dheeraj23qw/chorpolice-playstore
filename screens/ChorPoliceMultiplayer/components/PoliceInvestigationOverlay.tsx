import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface Props {
  visible: boolean;
}

/**
 * Full-screen, *transparent* overlay shown to non-Police players right after
 * the private role-reveal finishes and throughout the Police investigation.
 *
 * The background is dimmed just enough for the lock icon + text to be legible
 * while the underlying mystery cards are still visible (shuffling) underneath.
 * It automatically disappears once the Police picks a card — i.e. when the
 * parent <PoliceTurnView> unmounts (gamePhase → result).
 */
export const PoliceInvestigationOverlay: React.FC<Props> = React.memo(
  ({ visible }) => {
    const fade = useSharedValue(0);
    const lockPulse = useSharedValue(1);
    const textSlide = useSharedValue(24);
    const glowPulse = useSharedValue(0.6);

    useEffect(() => {
      if (visible) {
        fade.value = withDelay(200, withTiming(1, { duration: 400 }));
        textSlide.value = withDelay(
          300,
          withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }),
        );
        lockPulse.value = withDelay(
          500,
          withRepeat(
            withSequence(
              withTiming(1.12, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
              withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
          ),
        );
        glowPulse.value = withDelay(
          500,
          withRepeat(
            withSequence(
              withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
              withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
          ),
        );
      } else {
        fade.value = withTiming(0, { duration: 250 });
        textSlide.value = withTiming(24, { duration: 250 });
        lockPulse.value = 1;
        glowPulse.value = 0.6;
      }
    }, [visible]);

    const backdropStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
    const lockStyle = useAnimatedStyle(() => ({ transform: [{ scale: lockPulse.value }] }));
    const textStyle = useAnimatedStyle(() => ({ transform: [{ translateY: textSlide.value }] }));
    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowPulse.value,
      transform: [{ scale: 1.3 + 0.2 * (1 - glowPulse.value) }],
    }));

    if (!visible) return null;

    const lockSize = rf(10);

    return (
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        pointerEvents="none"
      >
        {/* Transparent dim + subtle blur — cards still visible underneath */}
        <BlurView intensity={8} tint="dark" style={StyleSheet.absoluteFill} />
        <View className="absolute inset-0 bg-black/15" />

        {/* Centered lock icon + text, positioned slightly below half screen */}
        <View
          className="flex-1 items-center justify-center"
          style={{ transform: [{ translateY: 70 }] }}
        >
          {/* Lock circle with pulsing glow ring behind it */}
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Animated.View
              style={[styles.glowRing, glowStyle, { width: lockSize * 2, height: lockSize * 2, borderRadius: lockSize }]}
            />
            <Animated.View style={[styles.lockCircle, lockStyle, { width: lockSize, height: lockSize, borderRadius: lockSize / 2 }]}>
              <LinearGradient
                colors={["#6366F1", "#4F46E5", "#818CF8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              >
                <View className="h-full w-full items-center justify-center">
                  <Ionicons name="lock-closed" size={rf(5)} color="white" />
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          <Animated.View style={textStyle} className="mt-8">
            <Text
              className="font-main-bold text-center text-white/90"
              style={{ fontSize: rf(2.2), letterSpacing: 1.5, lineHeight: rf(2.8) }}
            >
              Wait, Police is investigating...
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    );
  },
);

PoliceInvestigationOverlay.displayName = "PoliceInvestigationOverlay";

const styles = StyleSheet.create({
  backdrop: {
    zIndex: 999,
    elevation: 999,
  },
  lockCircle: {
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  glowRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
});
