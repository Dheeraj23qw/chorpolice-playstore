import React, { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Text } from "@/components/Text";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  crashId: string;
}

const createCrashId = () => {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `CP-${time}-${random}`;
};

/* ================================================================
 * Animated Button
 * Reanimated only for subtle press feedback.
 * All visual styling is NativeWind.
 * ================================================================ */

interface AnimatedButtonProps {
  children: ReactNode;
  onPress: () => void;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  className = "",
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 220,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 220,
    });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={className}
    >
      <Animated.View style={animatedStyle} className="h-full w-full">
        {children}
      </Animated.View>
    </Pressable>
  );
};

/* ================================================================
 * Error Boundary
 * ================================================================ */

class GlobalErrorBoundaryInner extends Component<
  Props & { bottomInset: number },
  State
> {
  public state: State = {
    hasError: false,
    error: null,
    crashId: createCrashId(),
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      crashId: createCrashId(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 [GlobalErrorBoundary] CRASH DETECTED:", {
      crashId: this.state.crashId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  /* ================================================================
   * Start Playing
   * ================================================================ */

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      crashId: createCrashId(),
    });

    requestAnimationFrame(() => {
      router.replace("/mode-select" as any);
    });
  };

  /* ================================================================
   * Tell Us
   * ================================================================ */

  private handleReport = () => {
    const crashId = this.state.crashId;
    const errorMessage = this.state.error?.message ?? "Unknown error";

    const errorStack = this.state.error?.stack
      ? this.state.error.stack.slice(0, 800)
      : "No stack available";

    this.setState({
      hasError: false,
      error: null,
      crashId: createCrashId(),
    });

    requestAnimationFrame(() => {
      router.push({
        pathname: "/report-bug" as any,
        params: {
          crashId,
          errorMessage,
          errorStack,
        },
      });
    });
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { bottomInset } = this.props;

    /* ================================================================
     * ERROR SCREEN
     * ================================================================ */

    return (
      <View className="flex-1 bg-[#050508]">
        {/* ============================================================
         * BACKGROUND
         * ============================================================ */}

        <View className="absolute inset-0 bg-[#050508]" />

        {/* Subtle ambient blocks — NativeWind only */}

        <View
          pointerEvents="none"
          className="absolute -right-32 -top-28 h-80 w-80 rounded-full bg-indigo-500/[0.07]"
        />

        <View
          pointerEvents="none"
          className="absolute -bottom-36 -left-32 h-96 w-96 rounded-full bg-indigo-600/[0.05]"
        />

        <View
          pointerEvents="none"
          className="absolute left-[-90px] top-[18%] h-64 w-64 rounded-full bg-red-500/[0.035]"
        />

        {/* ============================================================
         * CONTENT
         * ============================================================ */}

        <ScrollView
          className="flex-1"
          contentContainerClassName="
            flex-grow
            items-center
            justify-center
            px-5
            py-8
          "
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            entering={FadeInDown.springify()
              .damping(17)
              .stiffness(130)
              .mass(0.8)}
            className="w-full max-w-[430px] overflow-hidden rounded-[32px] border border-white/10 bg-[#0B0B11]"
          >
            <View
              className="items-center px-7 pt-8"
              style={{
                paddingBottom: Math.max(24, bottomInset + 12),
              }}
            >
              {/* ======================================================
               * ERROR ICON
               * ====================================================== */}

              <Animated.View
                entering={FadeIn.delay(80).springify().damping(14)}
                className="mb-5 h-24 w-24 items-center justify-center rounded-[28px] border border-red-400/20 bg-red-500/[0.08]"
              >
                <View className="h-16 w-16 items-center justify-center rounded-[22px] border border-red-300/10 bg-red-500/[0.06]">
                  <MaterialCommunityIcons
                    name="shield-alert-outline"
                    size={42}
                    color="#FCA5A5"
                  />
                </View>
              </Animated.View>

              {/* ======================================================
               * KICKER
               * ====================================================== */}

              <Text className="mb-1 font-main-bold text-[11px] uppercase tracking-[3px] text-indigo-300">
                GAME HELPER
              </Text>

              {/* ======================================================
               * TITLE
               * ====================================================== */}

              <Text className="mb-2 text-center font-main-bold text-[30px] text-white">
                Oops!
              </Text>

              {/* ======================================================
               * DESCRIPTION
               * ====================================================== */}

              <Text className="mb-6 max-w-[340px] text-center font-main-md text-[14px] leading-[21px] text-slate-300/70">
                The game ran into a small problem. Don&apos;t worry — you can
                safely return and continue playing.
              </Text>

              {/* ======================================================
               * HELP CODE
               * ====================================================== */}

              <View className="mb-5 w-full rounded-[22px] border border-white/10 bg-white/[0.035] px-4 py-3.5">
                <Text className="mb-1 font-main-bold text-[10px] uppercase tracking-[2px] text-white/35">
                  HELP CODE
                </Text>

                <Text
                  numberOfLines={1}
                  className="font-main-bold text-[14px] text-indigo-100"
                >
                  {this.state.crashId}
                </Text>
              </View>

              {/* ======================================================
               * START PLAYING
               * ====================================================== */}

              <AnimatedButton
                onPress={this.handleReset}
                className="mb-3 h-14 w-full overflow-hidden rounded-[20px]"
              >
                <View className="h-full w-full flex-row items-center justify-center rounded-[20px] border border-indigo-400/30 bg-indigo-500">
                  <MaterialCommunityIcons
                    name="gamepad-variant-outline"
                    size={23}
                    color="#FFFFFF"
                  />

                  <Text className="ml-2.5 font-main-bold text-[14px] uppercase tracking-[2px] text-white">
                    Start Playing
                  </Text>
                </View>
              </AnimatedButton>

              {/* ======================================================
               * TELL US
               * ====================================================== */}

              <AnimatedButton
                onPress={this.handleReport}
                className="h-14 w-full overflow-hidden rounded-[20px]"
              >
                <View className="h-full w-full flex-row items-center justify-center rounded-[20px] border border-red-400/20 bg-red-500/10">
                  <MaterialCommunityIcons
                    name="bug-outline"
                    size={20}
                    color="#FCA5A5"
                  />

                  <Text className="ml-2 font-main-bold text-[11px] uppercase tracking-[1.3px] text-red-200">
                    Tell Us
                  </Text>
                </View>
              </AnimatedButton>

              {/* ======================================================
               * FOOTER
               * ====================================================== */}

              <Text className="mt-5 text-center font-main-md text-[11px] text-white/30">
                We&apos;ll try to keep your game safe.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }
}

/* ================================================================
 * Safe Area Wrapper
 * ================================================================ */

export class GlobalErrorBoundary extends Component<Props> {
  render() {
    return <GlobalErrorBoundarySafeArea {...this.props} />;
  }
}

const GlobalErrorBoundarySafeArea: React.FC<Props> = (props) => {
  const insets = useSafeAreaInsets();

  return <GlobalErrorBoundaryInner {...props} bottomInset={insets.bottom} />;
};
