import React, { useMemo } from "react";
import { View, Pressable } from "react-native";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { PermissionStep, PermissionStatus } from "@/hooks/useNetworkPermissions";

type StepConfig = {
  key: PermissionStep;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeColor: string;
};

const STEPS: StepConfig[] = [
  {
    key: "checking_wifi",
    label: "Checking Wi-Fi...",
    icon: "wifi-outline",
    activeColor: "#60A5FA",
  },
  {
    key: "requesting_permissions",
    label: "Requesting permissions...",
    icon: "shield-checkmark-outline",
    activeColor: "#A78BFA",
  },
  {
    key: "acquiring_multicast",
    label: "Waking up local sensors...",
    icon: "radio-outline",
    activeColor: "#34D399",
  },
  {
    key: "ready",
    label: "Looking for nearby Chors...",
    icon: "search-outline",
    activeColor: "#FBBF24",
  },
];

interface HandshakeStatusProps {
  step: PermissionStep;
  status: PermissionStatus;
  discoveredCount: number;
  errorMessage: string | null;
  wifiSSID: string | null;
  onRetry: () => void;
  isHost: boolean;
}

/**
 * HandshakeStatus
 *
 * Multi-step connection status indicator that tells the user exactly
 * what's happening during the LAN discovery process.
 * Replaces the generic WaitingState spinner.
 */
export const HandshakeStatus: React.FC<HandshakeStatusProps> = ({
  step,
  status,
  discoveredCount,
  errorMessage,
  wifiSSID,
  onRetry,
  isHost,
}) => {
  const currentStepIndex = useMemo(
    () => STEPS.findIndex((s) => s.key === step),
    [step],
  );

  // ── Error / Denied state ──
  if (status === "no_wifi" || status === "denied" || status === "error") {
    return (
      <Animated.View
        entering={FadeInUp.duration(400).springify()}
        className="mx-4 overflow-hidden rounded-3xl"
      >
        <View className="absolute inset-0 rounded-3xl bg-red-500/10 blur-2xl" />

        <LinearGradient
          colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
          className="rounded-3xl border border-red-400/20 p-6"
        >
          {/* Icon */}
          <View className="mb-4 items-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
              <Ionicons
                name={
                  status === "no_wifi"
                    ? "wifi-outline"
                    : status === "denied"
                      ? "lock-closed-outline"
                      : "alert-circle-outline"
                }
                size={28}
                color="#F87171"
              />
            </View>
          </View>

          {/* Title */}
          <Text className="mb-2 text-center font-main-bold text-base text-red-300">
            {status === "no_wifi"
              ? "No Wi-Fi Connection"
              : status === "denied"
                ? "Permission Needed"
                : "Something Went Wrong"}
          </Text>

          {/* Message */}
          <Text className="mb-4 text-center text-sm leading-5 text-white/60">
            {errorMessage || "Please check your settings and try again."}
          </Text>

          {/* Retry button */}
          <Pressable
            onPress={onRetry}
            className="overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={["#7C3AED", "#4F46E5"]}
              className="items-center rounded-2xl py-3"
            >
              <Text className="font-main-bold text-sm text-white">
                Try Again
              </Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    );
  }

  // ── Success — found hosts (client) or ready to accept (host) ──
  if (status === "granted" && (discoveredCount > 0 || isHost)) {
    return (
      <Animated.View
        entering={FadeInUp.duration(400).springify()}
        className="mx-4 items-center py-4"
      >
        <Animated.View
          entering={FadeIn.delay(200)}
          className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15"
        >
          <Ionicons name="checkmark-circle" size={28} color="#34D399" />
        </Animated.View>

        <Text className="font-main-bold text-base text-emerald-300">
          {isHost
            ? "Lobby is live! Waiting for players..."
            : `Found ${discoveredCount} ${discoveredCount === 1 ? "lobby" : "lobbies"}!`}
        </Text>

        {wifiSSID ? (
          <Text className="mt-1 text-xs text-white/40">
            Connected to: {wifiSSID}
          </Text>
        ) : null}
      </Animated.View>
    );
  }

  // ── In-progress steps ──
  return (
    <Animated.View
      entering={FadeInUp.duration(400).springify()}
      className="mx-4 overflow-hidden rounded-3xl"
    >
      <View className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-2xl" />

      <LinearGradient
        colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
        className="rounded-3xl border border-white/10 p-6"
      >
        {/* Title */}
        <Text className="mb-5 text-center font-main-bold text-base text-white">
          Setting up connection...
        </Text>

        {/* Steps */}
        {STEPS.map((stepConfig, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <Animated.View
              key={stepConfig.key}
              entering={FadeInUp.delay(index * 120)
                .duration(350)
                .springify()}
              className="mb-3 flex-row items-center"
            >
              {/* Step indicator */}
              <View
                className="mr-4 h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isCompleted
                    ? "rgba(52, 211, 153, 0.15)"
                    : isActive
                      ? `${stepConfig.activeColor}20`
                      : "rgba(255, 255, 255, 0.05)",
                  borderWidth: isActive ? 1 : 0,
                  borderColor: isActive
                    ? `${stepConfig.activeColor}40`
                    : "transparent",
                }}
              >
                <Ionicons
                  name={
                    isCompleted
                      ? "checkmark"
                      : stepConfig.icon
                  }
                  size={isCompleted ? 18 : 20}
                  color={
                    isCompleted
                      ? "#34D399"
                      : isActive
                        ? stepConfig.activeColor
                        : "rgba(255,255,255,0.25)"
                  }
                />
              </View>

              {/* Label */}
              <Text
                className={`flex-1 text-sm ${
                  isCompleted
                    ? "text-emerald-300/80"
                    : isActive
                      ? "font-main-bold text-white"
                      : "text-white/30"
                }`}
              >
                {isCompleted
                  ? stepConfig.label.replace("...", " ✓")
                  : stepConfig.label}
              </Text>

              {/* Spinner for active */}
              {isActive && !isPending ? (
                <View className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : null}
            </Animated.View>
          );
        })}

        {wifiSSID ? (
          <Text className="mt-2 text-center text-xs text-white/30">
            Network: {wifiSSID}
          </Text>
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
};
