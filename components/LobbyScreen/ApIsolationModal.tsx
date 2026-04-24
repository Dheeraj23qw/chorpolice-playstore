import React from "react";
import { View, Pressable, Linking, Platform, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

interface ApIsolationModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * AP Isolation Detection Modal
 *
 * Shown when both devices are on Wi-Fi but the TCP connection fails,
 * indicating the router has AP Isolation (client isolation) enabled.
 *
 * Common in: Indian hostel WiFi, NIT networks, public cafes.
 * Solution: Use one phone's Mobile Hotspot instead.
 */
export const ApIsolationModal: React.FC<ApIsolationModalProps> = ({
  visible,
  onClose,
}) => {
  const openWifiSettings = () => {
    if (Platform.OS === "android") {
      Linking.openSettings();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center">
        {/* Dark overlay */}
        <Pressable
          className="absolute inset-0 bg-black/80"
          onPress={onClose}
        />

        {/* Modal content */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="mx-6 w-[90%] max-w-[400px] overflow-hidden rounded-[32px]"
        >
          {/* Glow */}
          <View className="absolute inset-0 rounded-[32px] bg-amber-500/15 blur-3xl" />

          <LinearGradient
            colors={[
              "rgba(255,255,255,0.08)",
              "rgba(255,255,255,0.03)",
              "rgba(0,0,0,0.3)",
            ]}
            className="rounded-[32px] border border-amber-400/20 p-6"
          >
            {/* Icon */}
            <View className="mb-4 items-center">
              <Animated.View
                entering={FadeIn.delay(200)}
                className="h-16 w-16 items-center justify-center rounded-full bg-amber-500/20"
              >
                <Ionicons name="shield-half-outline" size={32} color="#F59E0B" />
              </Animated.View>
            </View>

            {/* Title */}
            <Text className="mb-2 text-center font-main-bold text-lg text-amber-300">
              Network Restricted
            </Text>

            {/* Body */}
            <Text className="mb-4 text-center text-sm leading-5 text-white/70">
              Your router is blocking device-to-device connections (AP
              Isolation). This is common on hostel & public Wi-Fi networks.
            </Text>

            {/* Solution Box */}
            <View className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Text className="mb-2 font-main-bold text-xs uppercase tracking-widest text-indigo-300">
                Quick Fix
              </Text>
              <Text className="text-sm leading-5 text-white/80">
                Turn on one phone&apos;s{" "}
                <Text className="font-main-bold text-white">
                  Mobile Hotspot
                </Text>{" "}
                and connect the other phone to it. This gives you a direct,
                lag-free connection! 🚀
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={onClose}
                className="flex-1 items-center rounded-2xl border border-white/10 bg-white/5 py-3"
              >
                <Text className="font-main-bold text-sm text-white/60">
                  Dismiss
                </Text>
              </Pressable>

              <Pressable
                onPress={openWifiSettings}
                className="flex-1 overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  className="items-center rounded-2xl py-3"
                >
                  <Text className="font-main-bold text-sm text-black">
                    Open Settings
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};
