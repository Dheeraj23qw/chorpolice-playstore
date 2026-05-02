import React from "react";
import { Pressable, View } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import type { NetworkContext } from "@/hooks/useNetworkPermissions";

type PermissionStatus = "pending" | "granted" | "denied" | "no_wifi" | "error";

interface NetworkStatusBannerProps {
  status: PermissionStatus;
  networkContext: NetworkContext;
  errorMessage: string | null;
  isHost: boolean;
  onRetry: () => void;
  onOpenSettings: () => void;
}

interface BannerConfig {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  gradientColors: [string, string];
  borderColor: string;
  title: string;
  subtitle: string;
  action?: { label: string; onPress: () => void };
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  status,
  networkContext,
  errorMessage,
  isHost,
  onRetry,
  onOpenSettings,
}) => {
  // Don't show banner when everything is fine
  if (status === "granted") return null;
  // Don't show while still loading (unless host is bootstrapping)
  if (status === "pending" && !isHost) return null;

  const getBannerConfig = (): BannerConfig => {
    // ── Progress States (for Host) ──────────────────────────────────
    if (isHost && status !== "granted") {
      if (status === "pending") {
        return {
          icon: "sync-outline",
          iconColor: "#3b82f6",
          gradientColors: ["rgba(59,130,246,0.15)", "rgba(59,130,246,0.05)"],
          borderColor: "rgba(59,130,246,0.3)",
          title: "Starting Local Server...",
          subtitle: "Setting up your game lobby. Please wait.",
        };
      }
      if (status === "no_wifi" && networkContext === "none") {
        return {
          icon: "wifi-outline",
          iconColor: "#f97316",
          gradientColors: ["rgba(249,115,22,0.15)", "rgba(249,115,22,0.05)"],
          borderColor: "rgba(249,115,22,0.3)",
          title: "Checking Hotspot...",
          subtitle: "Please turn ON your Mobile Hotspot. No internet required.",
          action: { label: "Check Again", onPress: onRetry },
        };
      }
    }

    // ── No network at all ──────────────────────────────────────────
    if (status === "no_wifi" && networkContext === "none") {
      return {
        icon: "wifi-outline",
        iconColor: "#f97316",
        gradientColors: ["rgba(249,115,22,0.15)", "rgba(249,115,22,0.05)"],
        borderColor: "rgba(249,115,22,0.3)",
        title: "No Network Detected",
        subtitle: isHost 
          ? "Still checking... Keep your hotspot ON."
          : "Connect to the host's Mobile Hotspot or WiFi. Tip: Turn OFF Mobile Data if you can't see the host.",
        action: { label: "Check Again", onPress: onRetry },
      };
    }

    // ── Permission permanently denied ──────────────────────────────
    if (status === "denied") {
      const isPermanent =
        errorMessage?.includes("permanently") ||
        errorMessage?.includes("Settings");
      return {
        icon: "lock-closed-outline",
        iconColor: "#ef4444",
        gradientColors: ["rgba(239,68,68,0.15)", "rgba(239,68,68,0.05)"],
        borderColor: "rgba(239,68,68,0.3)",
        title: "Permission Required",
        subtitle:
          errorMessage ||
          "Location permission is needed to detect nearby players on the local network.",
        action: isPermanent
          ? { label: "Open Settings", onPress: onOpenSettings }
          : { label: "Grant Permission", onPress: onRetry },
      };
    }

    // ── Generic error ──────────────────────────────────────────────
    if (status === "error") {
      return {
        icon: "alert-circle-outline",
        iconColor: "#ef4444",
        gradientColors: ["rgba(239,68,68,0.12)", "rgba(239,68,68,0.04)"],
        borderColor: "rgba(239,68,68,0.25)",
        title: "Connection Error",
        subtitle: errorMessage || "Something went wrong. Please try again.",
        action: { label: "Check Again", onPress: onRetry },
      };
    }

    // ── Fallback (no_wifi with some connectivity) ─────────────────
    return {
      icon: "cloud-offline-outline",
      iconColor: "#f97316",
      gradientColors: ["rgba(249,115,22,0.12)", "rgba(249,115,22,0.04)"],
      borderColor: "rgba(249,115,22,0.25)",
      title: "Network Issue",
      subtitle:
        errorMessage ||
        (isHost
          ? "Enable your Mobile Hotspot so others can join."
          : "Connect to the host's network to join the lobby."),
      action: { label: "Check Again", onPress: onRetry },
    };
  };

  const config = getBannerConfig();

  return (
    <AnimatePresence>
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -8 }}
        transition={{ type: "timing", duration: 300 }}
        className="mb-4 overflow-hidden rounded-2xl"
      >
        <LinearGradient
          colors={config.gradientColors}
          className="p-4"
          style={{ borderWidth: 1, borderColor: config.borderColor, borderRadius: 16 }}
        >
          <View className="flex-row items-start gap-3">
            {/* Icon */}
            <View className="mt-0.5">
              <Ionicons name={config.icon} size={rf(2.2)} color={config.iconColor} />
            </View>

            {/* Text */}
            <View className="flex-1">
              <Text
                style={{ fontSize: rf(1.7), color: config.iconColor }}
                className="font-main-bold"
              >
                {config.title}
              </Text>
              <Text
                style={{ fontSize: rf(1.4) }}
                className="mt-1 text-white/60 font-main-md leading-5"
              >
                {config.subtitle}
              </Text>

              {/* Action Button */}
              {config.action && (
                <Pressable
                  onPress={config.action.onPress}
                  disabled={status === "pending"}
                  className="mt-3 self-start rounded-xl px-4 py-2 flex-row items-center gap-2"
                  style={{ 
                    backgroundColor: `${config.iconColor}25`, 
                    borderWidth: 1, 
                    borderColor: `${config.iconColor}50`,
                    opacity: status === "pending" ? 0.7 : 1
                  }}
                >
                  {status === "pending" && (
                    <MotiView
                      from={{ rotate: "0deg" }}
                      animate={{ rotate: "360deg" }}
                      transition={{ loop: true, duration: 1000, type: "timing" }}
                    >
                      <Ionicons name="sync-outline" size={rf(1.4)} color={config.iconColor} />
                    </MotiView>
                  )}
                  <Text
                    style={{ fontSize: rf(1.4), color: config.iconColor }}
                    className="font-main-bold uppercase tracking-wide"
                  >
                    {status === "pending" ? "Checking..." : config.action.label}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </LinearGradient>
      </MotiView>
    </AnimatePresence>
  );
};
