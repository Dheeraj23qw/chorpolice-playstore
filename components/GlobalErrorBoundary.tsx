import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  private handleCopyError = async () => {
    try {
      const errorMessage = [
        `Help Code: ${this.state.crashId}`,
        `Error: ${this.state.error?.message ?? "Unknown error"}`,
        `Stack: ${this.state.error?.stack ?? "No stack available"}`,
      ].join("\n\n");

      await Clipboard.setStringAsync(errorMessage);

      Alert.alert(
        "Copied",
        "Help code copied. Send it when reporting the problem.",
      );
    } catch {
      Alert.alert("Copy Failed", "Could not copy the help code.");
    }
  };

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

    return (
      <View className="flex-1 bg-[#050508]">
        {/* ================= BACKGROUND ================= */}

        <LinearGradient
          colors={["#020617", "#050508", "#0F172A", "#050508"]}
          locations={[0, 0.38, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />

        {/* Ambient glows */}

        <View
          pointerEvents="none"
          className="absolute -right-32 -top-28 h-80 w-80 rounded-full bg-indigo-500/20"
        />

        <View
          pointerEvents="none"
          className="absolute -bottom-36 -left-32 h-96 w-96 rounded-full bg-indigo-600/15"
        />

        <View
          pointerEvents="none"
          className="absolute left-[-90px] top-[18%] h-64 w-64 rounded-full bg-red-500/10"
        />

        {/* ================= CONTENT ================= */}

        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow items-center justify-center px-5 py-8"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <MotiView
            from={{
              opacity: 0,
              scale: 0.94,
              translateY: 24,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              translateY: 0,
            }}
            transition={{
              type: "spring",
              damping: 17,
              stiffness: 130,
            }}
            className="w-full max-w-[430px] overflow-hidden rounded-[40px] border border-white/10"
            style={{
              shadowColor: "#6366F1",
              shadowOffset: {
                width: 0,
                height: 18,
              },
              shadowOpacity: 0.3,
              shadowRadius: 30,
              elevation: 18,
            }}
          >
            <BlurView
              intensity={Platform.OS === "ios" ? 35 : 25}
              tint="dark"
              className="overflow-hidden rounded-[40px]"
            >
              {/* Card glass layer */}

              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.09)",
                  "rgba(255,255,255,0.035)",
                  "rgba(99,102,241,0.07)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute inset-0"
              />

              <View
                className="items-center px-7 pt-8"
                style={{
                  paddingBottom: Math.max(24, bottomInset + 12),
                }}
              >
                {/* ================= ICON ================= */}

                <MotiView
                  from={{
                    opacity: 0,
                    scale: 0.7,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    damping: 14,
                    stiffness: 180,
                    delay: 80,
                  }}
                  className="mb-5 h-24 w-24 overflow-hidden rounded-[30px] border border-red-400/20"
                >
                  <LinearGradient
                    colors={["rgba(248,113,113,0.22)", "rgba(99,102,241,0.10)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="h-full w-full items-center justify-center"
                  >
                    <MaterialCommunityIcons
                      name="shield-alert-outline"
                      size={46}
                      color="#FCA5A5"
                    />
                  </LinearGradient>
                </MotiView>

                {/* ================= KICKER ================= */}

                <Text className="mb-1 font-main-bold text-[11px] uppercase tracking-[3px] text-indigo-300">
                  GAME HELPER
                </Text>

                {/* ================= TITLE ================= */}

                <Text className="mb-2 text-center font-main-bold text-[30px] text-white">
                  Oops!
                </Text>

                {/* ================= DESCRIPTION ================= */}

                <Text className="mb-6 max-w-[340px] text-center font-main-md text-[14px] leading-[21px] text-slate-300/70">
                  The game ran into a small problem. Don&apos;t worry — you can
                  safely return and continue playing.
                </Text>

                {/* ================= HELP CODE ================= */}

                <View className="mb-5 w-full flex-row items-center rounded-[24px] border border-white/10 bg-white/[0.045] px-4 py-3.5">
                  <View className="mr-3 flex-1">
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

                  <Pressable
                    onPress={this.handleCopyError}
                    hitSlop={8}
                    className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07]"
                  >
                    {({ pressed }) => (
                      <MotiView
                        animate={{
                          scale: pressed ? 0.88 : 1,
                        }}
                        transition={{
                          type: "spring",
                          damping: 15,
                          stiffness: 220,
                        }}
                        className="h-full w-full items-center justify-center"
                      >
                        <MaterialCommunityIcons
                          name="content-copy"
                          size={19}
                          color="#CBD5E1"
                        />
                      </MotiView>
                    )}
                  </Pressable>
                </View>

                {/* ================= PRIMARY BUTTON ================= */}

                <Pressable
                  onPress={this.handleReset}
                  hitSlop={4}
                  className="mb-3 h-14 w-full overflow-hidden rounded-[22px]"
                  style={{
                    shadowColor: "#6366F1",
                    shadowOffset: {
                      width: 0,
                      height: 10,
                    },
                    shadowOpacity: 0.38,
                    shadowRadius: 18,
                    elevation: 10,
                  }}
                >
                  {({ pressed }) => (
                    <MotiView
                      animate={{
                        scale: pressed ? 0.97 : 1,
                      }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 200,
                      }}
                      className="h-full w-full overflow-hidden rounded-[22px]"
                    >
                      <LinearGradient
                        colors={["#818CF8", "#6366F1", "#4F46E5"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="h-full w-full flex-row items-center justify-center"
                      >
                        <MaterialCommunityIcons
                          name="gamepad-variant-outline"
                          size={23}
                          color="#FFFFFF"
                        />

                        <Text className="ml-2.5 font-main-bold text-[14px] uppercase tracking-[2px] text-white">
                          Play Again
                        </Text>
                      </LinearGradient>
                    </MotiView>
                  )}
                </Pressable>

                {/* ================= SECONDARY ACTIONS ================= */}

                <View className="w-full flex-row">
                  {/* Copy */}

                  <Pressable
                    onPress={this.handleCopyError}
                    hitSlop={4}
                    className="mr-1.5 h-14 flex-1 overflow-hidden rounded-[21px]"
                  >
                    {({ pressed }) => (
                      <MotiView
                        animate={{
                          scale: pressed ? 0.96 : 1,
                        }}
                        transition={{
                          type: "spring",
                          damping: 15,
                          stiffness: 200,
                        }}
                        className="h-full w-full items-center justify-center rounded-[21px] border border-white/10 bg-white/[0.045]"
                      >
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="clipboard-text-outline"
                            size={20}
                            color="#CBD5E1"
                          />

                          <Text className="ml-2 font-main-bold text-[11px] uppercase tracking-[1.3px] text-slate-300">
                            Copy Code
                          </Text>
                        </View>
                      </MotiView>
                    )}
                  </Pressable>

                  {/* Report */}

                  <Pressable
                    onPress={this.handleReport}
                    hitSlop={4}
                    className="ml-1.5 h-14 flex-1 overflow-hidden rounded-[21px]"
                  >
                    {({ pressed }) => (
                      <MotiView
                        animate={{
                          scale: pressed ? 0.96 : 1,
                        }}
                        transition={{
                          type: "spring",
                          damping: 15,
                          stiffness: 200,
                        }}
                        className="h-full w-full items-center justify-center rounded-[21px] border border-red-400/20 bg-red-500/10"
                      >
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="bug-outline"
                            size={20}
                            color="#FCA5A5"
                          />

                          <Text className="ml-2 font-main-bold text-[11px] uppercase tracking-[1.3px] text-red-200">
                            Tell Us
                          </Text>
                        </View>
                      </MotiView>
                    )}
                  </Pressable>
                </View>

                {/* ================= FOOTER ================= */}

                <Text className="mt-5 text-center font-main-md text-[11px] text-white/30">
                  We&apos;ll try to keep your game safe.
                </Text>
              </View>
            </BlurView>
          </MotiView>
        </ScrollView>
      </View>
    );
  }
}

/**
 * Safe-area wrapper.
 *
 * Kept outside the actual ErrorBoundary class so the boundary
 * itself remains a normal React class component.
 */
export class GlobalErrorBoundary extends Component<Props> {
  render() {
    return <GlobalErrorBoundarySafeArea {...this.props} />;
  }
}

const GlobalErrorBoundarySafeArea: React.FC<Props> = (props) => {
  const insets = useSafeAreaInsets();

  return <GlobalErrorBoundaryInner {...props} bottomInset={insets.bottom} />;
};
