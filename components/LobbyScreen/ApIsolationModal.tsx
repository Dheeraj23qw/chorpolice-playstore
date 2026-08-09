import React from "react";
import { View, Pressable, Linking, Platform, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { MotiView } from "moti";

interface ApIsolationModalProps {
  visible: boolean;
  onClose: () => void;
  isHost: boolean; // Tells us if this phone is the "Brother/Host"
}

export const ApIsolationModal: React.FC<ApIsolationModalProps> = ({
  visible,
  onClose,
  isHost,
}) => {
  const handleAction = () => {
    if (Platform.OS === "android") {
      if (isHost) {
        // Send Host directly to Hotspot settings
        Linking.sendIntent("android.settings.TETHER_SETTINGS");
      } else {
        // Send Client directly to Wi-Fi list to find the Host
        Linking.sendIntent("android.settings.WIFI_SETTINGS");
      }
    } else {
      // iOS fallback (general settings)
      Linking.openSettings();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center">
        {/* BACKDROP */}
        <Pressable className="absolute inset-0 bg-black/80" onPress={onClose} />

        {/* MODAL */}
        <MotiView
          from={{ opacity: 0, scale: 0.92, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 120 }}
          className="overflow-hidden rounded-[32px]"
        >
          <View className="mx-6 w-[90%] max-w-[400px]">
          {/* Glow Effect */}
          <View className="absolute inset-0 rounded-[32px] bg-amber-500/15 blur-3xl" />

          <LinearGradient
            colors={[
              "rgba(255,255,255,0.08)",
              "rgba(255,255,255,0.03)",
              "rgba(0,0,0,0.3)",
            ]}
            className="rounded-[32px] border border-amber-400/20"
          >
            <View className="p-6">
            {/* ICON */}
            <MotiView
              from={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 100 }}
            >
              <View className="mb-4 items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                <Ionicons name="wifi-outline" size={32} color="#F59E0B" />
              </View>
              </View>
            </MotiView>

            {/* TITLE */}
            <Text className="mb-2 text-center font-main-bold text-lg text-amber-300">
              {isHost ? "Start a Hotspot" : "Join the Host"}
            </Text>

            {/* DESCRIPTION */}
            <Text className="mb-4 text-center text-sm leading-5 text-white/70">
              The current Wi-Fi is blocking player connections. To play
              together, one player must provide a direct connection.
            </Text>

            {/* DYNAMIC FIX BOX */}
            <View className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Text className="mb-2 font-main-bold text-xs uppercase tracking-widest text-indigo-300">
                {isHost ? "Your Action" : "Waiting for Host"}
              </Text>

              <Text className="text-sm leading-5 text-white/80">
                {isHost ? (
                  <>
                    Turn on your{" "}
                    <Text className="font-main-bold text-white">
                      Mobile Hotspot
                    </Text>{" "}
                    and ask your friends to connect to your phone.
                  </>
                ) : (
                  <>
                    Please ask the{" "}
                    <Text className="font-main-bold text-white">Host</Text> to
                    turn on their Hotspot, then connect your Wi-Fi to their
                    device.
                  </>
                )}
              </Text>
            </View>

            {/* BUTTONS */}
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
                onPress={handleAction}
                className="flex-1 overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  className="rounded-2xl"
                >
                  <View className="items-center py-3">
                  <Text className="font-main-bold text-sm text-black">
                    {isHost ? "Open Hotspot" : "Open Wi-Fi"}
                  </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
            </View>
          </LinearGradient>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
