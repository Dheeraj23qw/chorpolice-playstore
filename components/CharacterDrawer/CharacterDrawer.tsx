import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Text";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface CharacterDrawerProps {
  /** Dialogue message to display. */
  message: string;

  /** Character image source. */
  avatarSource: ImageSourcePropType;

  /** Automatically dismiss the overlay drawer. */
  autoHide?: boolean;

  /** Duration the drawer remains visible before dismissing. */
  autoHideDurationMs?: number;

  /** Render inline instead of as an overlay. */
  persistent?: boolean;

  /** Called after the drawer finishes hiding. */
  onDismiss?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SPRING_CONFIG = {
  damping: 17,
  stiffness: 125,
  mass: 0.8,
};

const ENTER_DELAY = 100;
const ENTER_SETTLE_TIME = 500;
const EXIT_DURATION = 350;

const DESIGN_WIDTH = 390;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const useDrawerScale = () => {
  const { width } = useWindowDimensions();

  return clamp(width / DESIGN_WIDTH, 0.85, 1.15);
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const CharacterDrawer: React.FC<CharacterDrawerProps> = ({
  message,
  avatarSource,
  autoHide = false,
  autoHideDurationMs = 3000,
  persistent = false,
  onDismiss,
}) => {
  if (persistent) {
    return <PersistentDrawer message={message} avatarSource={avatarSource} />;
  }

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

// ─────────────────────────────────────────────────────────────────────────────
// Persistent drawer
// ─────────────────────────────────────────────────────────────────────────────

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
      from={{
        opacity: 0,
        translateY: 24,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
        scale: 1,
      }}
      transition={{
        type: "timing",
        duration: 450,
        delay: 100,
      }}
      className="w-full items-center px-5"
      style={{
        paddingTop: 32 * scale,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      <DrawerCard message={message} avatarSource={avatarSource} />
    </MotiView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Overlay drawer
// ─────────────────────────────────────────────────────────────────────────────

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

  const [drawerHeight, setDrawerHeight] = useState(0);

  const translateY = useSharedValue(screenHeight + 200);

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  // ─────────────────────────────────────────────────────────────────────────
  // Entrance / auto-hide animation
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (drawerHeight <= 0) {
      return;
    }

    translateY.value = withDelay(ENTER_DELAY, withSpring(0, SPRING_CONFIG));

    if (!autoHide) {
      return;
    }

    const totalDelay =
      ENTER_DELAY + ENTER_SETTLE_TIME + Math.max(autoHideDurationMs, 0);

    translateY.value = withDelay(
      totalDelay,
      withTiming(
        drawerHeight + 120,
        {
          duration: EXIT_DURATION,
          easing: Easing.inOut(Easing.ease),
        },
        (finished) => {
          if (finished) {
            runOnJS(handleDismiss)();
          }
        },
      ),
    );
  }, [drawerHeight, autoHide, autoHideDurationMs, handleDismiss, translateY]);

  // ─────────────────────────────────────────────────────────────────────────
  // Animated style
  // ─────────────────────────────────────────────────────────────────────────

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  }));

  // ─────────────────────────────────────────────────────────────────────────
  // Measure card
  // ─────────────────────────────────────────────────────────────────────────

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;

      if (height > 0 && Math.abs(height - drawerHeight) > 1) {
        setDrawerHeight(height);
      }
    },
    [drawerHeight],
  );

  return (
    <Animated.View
      onLayout={handleLayout}
      pointerEvents="box-none"
      className="absolute left-5 right-5 z-[999] items-center"
      style={[
        {
          bottom: Math.max(insets.bottom, 12),
        },
        animatedStyle,
      ]}
    >
      <DrawerCard message={message} avatarSource={avatarSource} />
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Character avatar
// ─────────────────────────────────────────────────────────────────────────────

interface CharacterAvatarProps {
  avatarSource: ImageSourcePropType;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ avatarSource }) => {
  const scale = useDrawerScale();

  const characterSize = 148 * scale;
  const glowSize = characterSize + 10;

  const bob = useSharedValue(0);
  const breathe = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    const LOOP = -1;

    bob.value = withRepeat(
      withTiming(1, {
        duration: 1300,
        easing: Easing.inOut(Easing.ease),
      }),
      LOOP,
      true,
    );

    breathe.value = withRepeat(
      withTiming(1.035, {
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
      }),
      LOOP,
      true,
    );

    glow.value = withRepeat(
      withTiming(1, {
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
      }),
      LOOP,
      true,
    );

    return () => {
      bob.value = 0;
      breathe.value = 1;
      glow.value = 0;
    };
  }, [bob, breathe, glow]);

  const characterStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: -6 * bob.value,
      },
      {
        scale: breathe.value,
      },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.3,
    transform: [
      {
        scale: 1 + glow.value * 0.08,
      },
    ],
  }));

  return (
    <Animated.View style={characterStyle}>
      {/* Soft character glow */}
      <Animated.View
        className="absolute rounded-full bg-indigo-400/20"
        style={[
          glowStyle,
          {
            width: glowSize,
            height: glowSize,
            left: (characterSize - glowSize) / 2,
            top: (characterSize - glowSize) / 2,
          },
        ]}
      />

      {/* Outer glow ring */}
      <View
        className="absolute rounded-full border border-indigo-300/20"
        style={{
          width: characterSize + 4,
          height: characterSize + 4,
          left: -2,
          top: -2,
        }}
      />

      {/* Character */}
      <Image
        source={avatarSource}
        resizeMode="cover"
        className="rounded-full border-[3px] border-white/25"
        style={{
          width: characterSize,
          height: characterSize,
        }}
      />
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Drawer card
// ─────────────────────────────────────────────────────────────────────────────

interface DrawerCardProps {
  message: string;
  avatarSource: ImageSourcePropType;
}

const DrawerCard: React.FC<DrawerCardProps> = ({ message, avatarSource }) => {
  const scale = useDrawerScale();

  const cardTopPadding = 96 * scale;
  const characterWrapperPadding = 76 * scale;
  const horizontalPadding = 22 * scale;

  const fontSize = clamp(15 * scale, 13, 17);
  const lineHeight = Math.round(fontSize * 1.45);

  return (
    <View
      className="w-full max-w-[460px] items-center"
      style={{
        paddingTop: characterWrapperPadding,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CHARACTER */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <MotiView
        from={{
          opacity: 0,
          translateY: 18,
          scale: 0.88,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          damping: 13,
          stiffness: 145,
          delay: 200,
        }}
        className="absolute top-0 z-20 items-center justify-center"
      >
        <CharacterAvatar avatarSource={avatarSource} />
      </MotiView>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CARD */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <View
        className="w-full overflow-hidden rounded-[30px] border border-white/[0.10]"
        style={{
          minHeight: 112 * scale,
          paddingTop: cardTopPadding,
          paddingHorizontal: horizontalPadding,
          paddingBottom: 18 * scale,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 14,
          },
          shadowOpacity: 0.35,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        {/* Glass background */}
        <BlurView intensity={45} tint="dark" className="absolute inset-0" />

        {/* Clean dark glass layer */}
        <View className="absolute inset-0 bg-[#11131A]/75" />

        {/* Subtle top highlight */}
        <View className="absolute left-8 right-8 top-0 h-px bg-white/15" />

        {/* Subtle bottom gradient-like layer */}
        <View className="absolute bottom-0 left-0 right-0 h-10 bg-black/10" />

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* MESSAGE */}
        {/* ──────────────────────────────────────────────────────────────── */}

        <View className="items-center">
          <MotiView
            from={{
              opacity: 0,
              translateY: 8,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              type: "timing",
              duration: 350,
              delay: 350,
            }}
          >
            <Text
              className="text-center font-main-bold text-white/90"
              style={{
                fontSize,
                lineHeight,
                letterSpacing: 0.15,
              }}
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
