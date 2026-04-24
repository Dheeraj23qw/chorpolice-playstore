import React, { useMemo, useEffect, useRef } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  FadeInUp,
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Text } from "@/components/Text";

// ───────────────── TYPES ─────────────────
export type HandshakeStatusType =
  | "no_wifi"
  | "denied"
  | "error"
  | "low_battery"
  | "location_off"
  | "granted"
  | "loading";

interface Props {
  step:
    | "checking_wifi"
    | "requesting_permissions"
    | "acquiring_multicast"
    | "checking_stability"
    | "ready";
  status: HandshakeStatusType;
  discoveredCount: number;
  errorMessage: string | null;
  wifiSSID: string | null;
  onRetry: () => void;
  onOpenSettings: () => void;
  isHost: boolean;
}

// ───────────────── STEPS ─────────────────
const STEPS = [
  {
    key: "checking_wifi",
    label: "Verifying Wi-Fi...",
    icon: "wifi-outline",
    color: "#60A5FA",
  },
  {
    key: "requesting_permissions",
    label: "Security Handshake...",
    icon: "shield-checkmark-outline",
    color: "#A78BFA",
  },
  {
    key: "acquiring_multicast",
    label: "Local Discovery Active",
    icon: "radio-outline",
    color: "#34D399",
  },
  {
    key: "checking_stability",
    label: "Optimizing Engine...",
    icon: "flash-outline",
    color: "#2DD4BF",
  },
  {
    key: "ready",
    label: "Ready for Match",
    icon: "search-outline",
    color: "#FBBF24",
  },
] as const;

// ───────────────── COMPONENT ─────────────────
export const HandshakeStatus: React.FC<Props> = ({
  step,
  status,
  discoveredCount,
  errorMessage,
  wifiSSID,
  onRetry,
  onOpenSettings,
  isHost,
}) => {
  const lastStepRef = useRef<number>(-1);

  const currentStepIndex = useMemo(() => {
    const index = STEPS.findIndex((s) => s.key === step);
    return index === -1 ? 0 : index;
  }, [step]);

  const isError = useMemo(
    () =>
      ["no_wifi", "denied", "error", "low_battery", "location_off"].includes(
        status,
      ),
    [status],
  );

  const isSuccess = useMemo(() => status === "granted", [status]);

  // ─── HAPTICS ───
  useEffect(() => {
    if (lastStepRef.current === currentStepIndex) return;
    lastStepRef.current = currentStepIndex;

    if (isSuccess) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (!isError) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [currentStepIndex, isSuccess, isError]);

  // ─── SPINNER ANIMATION ───
  const spin = useAnimatedStyle(() => ({
    transform: [
      { rotate: withRepeat(withTiming("360deg", { duration: 800 }), -1) },
    ],
  }));

  // ───────────────── ERROR UI ─────────────────
  if (isError) {
    const isPermissionDenied = status === "denied";

    return (
      <Animated.View
        entering={FadeInUp.springify()}
        layout={LinearTransition.springify()}
        className="mx-4 overflow-hidden rounded-3xl border border-red-500/20 bg-red-500/5"
      >
        <LinearGradient
          colors={["rgba(255,50,50,0.1)", "transparent"]}
          className="p-6"
        >
          <View className="mb-4 items-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
              <Ionicons name="alert-circle-outline" size={30} color="#F87171" />
            </View>
          </View>

          <Text className="mb-2 text-center font-main-bold text-lg text-red-300">
            {status === "low_battery"
              ? "Stability Alert"
              : "Connection Blocked"}
          </Text>

          <Text className="mb-6 text-center text-sm leading-5 text-white/60">
            {status === "low_battery"
              ? "Battery too low for stable hosting. Plug in to continue."
              : errorMessage || "Something went wrong"}
          </Text>

          <Pressable
            onPress={isPermissionDenied ? onOpenSettings : onRetry}
            className="active:opacity-80"
          >
            <LinearGradient
              colors={
                isPermissionDenied
                  ? ["#6366f1", "#4338ca"]
                  : ["#EF4444", "#991B1B"]
              }
              className="flex-row items-center justify-center rounded-2xl py-4"
            >
              <Ionicons
                name={
                  isPermissionDenied ? "settings-outline" : "refresh-outline"
                }
                size={18}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="font-main-bold uppercase tracking-widest text-white">
                {isPermissionDenied
                  ? "Authorize in Settings"
                  : "Retry Connection"}
              </Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    );
  }

  // ───────────────── SUCCESS UI ─────────────────
  if (isSuccess) {
    return (
      <Animated.View
        entering={FadeIn.duration(600)}
        className="items-center py-6"
      >
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
          <Ionicons name="checkmark-done-circle" size={32} color="#34D399" />
        </View>

        <Text className="text-center font-main-bold text-xl text-white">
          {isHost
            ? "Lobby Active & Waiting"
            : `Detected ${discoveredCount} Nearby Games`}
        </Text>

        <View className="mt-3 flex-row items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">
          <Ionicons
            name="wifi"
            size={12}
            color="#34D399"
            style={{ marginRight: 6 }}
          />
          <Text className="text-[10px] uppercase tracking-widest text-white/40">
            {wifiSSID || "Secure LAN"}
          </Text>
        </View>
      </Animated.View>
    );
  }

  // ───────────────── LOADING UI ─────────────────
  return (
    <Animated.View
      layout={LinearTransition.springify()}
      className="mx-4 overflow-hidden rounded-[32px] border border-white/10 bg-white/5"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
        className="p-6"
      >
        <Text className="mb-6 text-center text-[10px] uppercase tracking-widest text-white/50">
          Initializing Secure Protocol
        </Text>

        {STEPS.map((s, i) => {
          const isActive = i === currentStepIndex;
          const isDone = i < currentStepIndex;

          return (
            <View key={s.key} className="mb-4 flex-row items-center">
              <View
                className="mr-4 h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDone
                    ? "#34D39920"
                    : isActive
                      ? `${s.color}20`
                      : "#ffffff05",
                }}
              >
                {isActive ? (
                  <Animated.View
                    style={[
                      {
                        height: 16,
                        width: 16,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: "rgba(255,255,255,0.2)",
                        borderTopColor: "#fff",
                      },
                      spin,
                    ]}
                  />
                ) : (
                  <Ionicons
                    name={isDone ? "checkmark" : s.icon}
                    size={18}
                    color={isDone ? "#34D399" : "#ffffff40"}
                  />
                )}
              </View>

              <Text
                className={`flex-1 text-sm ${isActive ? "font-main-bold text-white" : isDone ? "text-emerald-400/60" : "text-white/20"}`}
              >
                {s.label}
              </Text>
            </View>
          );
        })}
      </LinearGradient>
    </Animated.View>
  );
};
