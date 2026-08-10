import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import { Text } from "@/components/Text";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface CharacterDrawerProps {
  /** The dialogue message to display. */
  message: string;
  /** The character image source (kid1–kid13). */
  avatarSource: ImageSourcePropType;

  /** If true the drawer auto-dismisses after `autoHideDurationMs`. */
  autoHide?: boolean;
  /** Milliseconds before auto-hide (default 3000). */
  autoHideDurationMs?: number;

  /** If true renders inline (fade-in, no overlay). */
  persistent?: boolean;

  /** Called after the drawer finishes hiding. */
  onDismiss?: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SPRING_CONFIG = { damping: 16, stiffness: 120, mass: 0.8 };

// Design is based on a 390pt-wide phone; sizes scale from there (0.85x–1.15x).
function useDrawerScale() {
  const { width } = useWindowDimensions();
  return Math.min(Math.max(width / 390, 0.85), 1.15);
}

// ─── Component ──────────────────────────────────────────────────────────────

const CharacterDrawer: React.FC<CharacterDrawerProps> = ({
  message,
  avatarSource,
  autoHide = false,
  autoHideDurationMs = 3000,
  persistent = false,
  onDismiss,
}) => {
  // ── Persistent (inline) mode ────────────────────────────────────────────
  if (persistent) {
    return (
      <PersistentDrawer
        message={message}
        avatarSource={avatarSource}
      />
    );
  }

  // ── Overlay (animated slide-up) mode ────────────────────────────────────
  return (
    <OverlayDrawer
      message={message}
      avatarSource={avatarSource}
      autoHide={autoHide}
      autoHideDurationMs={autoHideDurationMs}
      onDismiss={onDismiss}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Persistent drawer — inline layout, fade-in + translateY, stays forever
// ═══════════════════════════════════════════════════════════════════════════

interface PersistentDrawerProps {
  message: string;
  avatarSource: ImageSourcePropType;
}

const PersistentDrawer: React.FC<PersistentDrawerProps> = ({
  message,
  avatarSource,
}) => {
  const insets = useSafeAreaInsets();
  const scale = useDrawerScale();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: "timing",
        duration: 500,
        delay: 200,
      }}
      className="px-5 items-center w-full"
      style={{
        paddingTop: 44 * scale,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
      }}
    >
      <DrawerCard message={message} avatarSource={avatarSource} />
    </MotiView>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Overlay drawer — absolute positioned, slides from bottom, auto-hides
// ═══════════════════════════════════════════════════════════════════════════

interface OverlayDrawerProps {
  message: string;
  avatarSource: ImageSourcePropType;
  autoHide: boolean;
  autoHideDurationMs: number;
  onDismiss?: () => void;
}

const OverlayDrawer: React.FC<OverlayDrawerProps> = ({
  message,
  avatarSource,
  autoHide,
  autoHideDurationMs,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  // We measure the drawer's actual height via onLayout and use that for the
  // initial off-screen translateY so we're never guessing.
  const [drawerHeight, setDrawerHeight] = useState(0);
  const translateY = useSharedValue(screenHeight); // start off-screen

  const handleDismissJS = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  // When we know the drawer height → spring it into view
  useEffect(() => {
    if (drawerHeight === 0) return;

    // Slide in
    translateY.value = withDelay(
      100,
      withSpring(0, SPRING_CONFIG),
    );

    if (autoHide) {
      // After the visible duration, slide back down then call dismiss
      const totalDelay = 100 + 500 + autoHideDurationMs; // entrance delay + spring settle + visible time
      translateY.value = withDelay(
        totalDelay,
        withTiming(
          drawerHeight + 100,
          { duration: 350, easing: Easing.inOut(Easing.ease) },
          (finished) => {
            if (finished) {
              runOnJS(handleDismissJS)();
            }
          },
        ),
      );
    }
  }, [drawerHeight]); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setDrawerHeight(h);
  }, []);

  return (
    <Animated.View
      onLayout={onLayout}
      className="absolute left-5 right-5 z-[999] items-center"
      style={[
        { bottom: insets.bottom > 0 ? insets.bottom + 8 : 16 },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <DrawerCard message={message} avatarSource={avatarSource} />
    </Animated.View>
  );
};

// ─── CharacterAvatar — idle "alive" animations (bob, breathe, pulsing glow) ───

const CharacterAvatar: React.FC<{ avatarSource: ImageSourcePropType }> = ({
  avatarSource,
}) => {
  const scale = useDrawerScale();
  const charSize = 152 * scale;
  const glowSize = charSize + 8;

  const bob = useSharedValue(0);
  const breathe = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    const LOOP = -1;
    bob.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      LOOP,
      true,
    );
    breathe.value = withRepeat(
      withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      LOOP,
      true,
    );
    glow.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      LOOP,
      true,
    );
  }, []);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -7 * bob.value },
      { scale: breathe.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + 0.4 * glow.value,
    transform: [{ scale: 1 + 0.1 * glow.value }],
  }));

  return (
    <Animated.View style={bodyStyle}>
      {/* Filled glow hugging the avatar edge (no gap) */}
      <Animated.View
        className="absolute rounded-full bg-indigo-500/20"
        style={[
          glowStyle,
          {
            width: glowSize,
            height: glowSize,
            left: (charSize - glowSize) / 2,
            top: (charSize - glowSize) / 2,
          },
        ]}
      />
      <Image
        source={avatarSource}
        className="rounded-full border-[3px] border-white/30"
        style={{ width: charSize, height: charSize }}
        resizeMode="cover"
      />
    </Animated.View>
  );
};

// ─── DrawerCard — shared card with overlapping character (NativeWind styled) ───

interface DrawerCardProps {
  message: string;
  avatarSource: ImageSourcePropType;
}

const DrawerCard: React.FC<DrawerCardProps> = ({ message, avatarSource }) => {
  const scale = useDrawerScale();

  const cardTopPad = 100 * scale;
  const wrapperTopPad = 80 * scale;
  const cardPadX = 24 * scale;
  const fontSize = Math.max(13, Math.min(17, 15 * scale));
  const lineHeight = Math.round(fontSize * 1.5);

  return (
    <View
      className="w-full max-w-[460px] items-center"
      style={{ paddingTop: wrapperTopPad }}
    >
      {/* ── Character (overlaps above the card) ── */}
      <MotiView
        from={{ opacity: 0, translateY: 20, scale: 0.85 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{
          type: "spring",
          damping: 12,
          stiffness: 150,
          delay: 300,
        }}
        className="absolute top-0 z-10 items-center justify-center"
      >
        {/* Glow ring behind character */}
        <CharacterAvatar avatarSource={avatarSource} />
      </MotiView>

      {/* ── Card (glassy) ── */}
      <View
        className="w-full rounded-[28px] overflow-hidden border border-white/15 shadow-2xl"
        style={{
          paddingTop: cardTopPad,
          paddingHorizontal: cardPadX,
          paddingBottom: 16 * scale,
          minHeight: 115 * scale,
        }}
      >
        {/* Frosted glass backdrop */}
        <BlurView
          intensity={40}
          tint="dark"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        {/* Slight dark overlay for text contrast */}
        <View className="absolute inset-0 bg-slate-900/40" />

        {/* Border highlight (top edge) */}
        <View className="absolute top-0 left-6 right-6 h-[1px] bg-white/20" />

        {/* Message text */}
        <View className="items-center">
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: 500 }}
          >
            <Text
              className="font-main-bold text-white/90 text-center tracking-[0.2px]"
              style={{ fontSize, lineHeight }}
            >
              {message}
            </Text>
          </MotiView>
        </View>
      </View>
    </View>
  );
};

export default React.memo(CharacterDrawer);
