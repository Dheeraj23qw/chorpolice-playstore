import React, { useState } from "react";
import { View, FlatList, TextInput, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";

import { PlayerListItem } from "./PlayerListItem";

export const PlayersList = ({ lobby, getAvatarSource }: any) => {
  const data = lobby.isHost ? lobby.players : lobby.allHosts;
  const [manualIp, setManualIp] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const handleManualConnect = () => {
    const trimmed = manualIp.trim();
    // Basic IP validation
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

    if (!ipRegex.test(trimmed)) {
      toast.error("Invalid IP", "Please enter a valid IP address like 192.168.1.10");
      return;
    }

    lobby.handleJoin({
      ip: trimmed,
      deviceName: `Manual (${trimmed})`,
      port: 41235,
    });
    setShowManualInput(false);
    setManualIp("");
  };

  return (
    <View className="flex-1">
      <FlatList
        data={data}
        keyExtractor={(item: any) => item.id || item.ip}
        renderItem={({ item, index }) => (
          <PlayerListItem
            item={item}
            index={index}
            lobby={lobby}
            getAvatarSource={getAvatarSource}
          />
        )}
        ListEmptyComponent={
          !lobby.isHost ? (
            <Animated.View
              entering={FadeInUp.duration(400).springify()}
              className="mt-8 overflow-hidden rounded-3xl"
            >
              <View className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-2xl" />

              <LinearGradient
                colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
                className="rounded-3xl border border-white/10 p-5"
              >
                <Text className="font-main-bold text-base text-white">
                  Still searching for lobbies...
                </Text>
                <Text className="mt-2 text-sm leading-5 text-white/70">
                  Make sure both phones are on the{" "}
                  <Text className="font-main-bold text-white">same Wi-Fi</Text>{" "}
                  and the host screen is already open.
                </Text>

                {/* Troubleshooting tips */}
                <View className="mt-4 rounded-2xl border border-white/5 bg-white/5 p-3">
                  <Text className="mb-2 text-[10px] uppercase tracking-widest text-indigo-300">
                    Troubleshooting
                  </Text>
                  <Text className="text-xs leading-4 text-white/50">
                    • Check that Wi-Fi is turned on{"\n"}
                    • Try toggling Airplane Mode once{"\n"}
                    • Both devices must be on same network{"\n"}
                    • If on hostel WiFi, try using Hotspot instead
                  </Text>
                </View>

                <Text className="mt-3 text-xs text-white/40">
                  Your IP: {lobby.localIp || "unknown"}
                </Text>

                {/* Manual IP Fallback */}
                <Pressable
                  onPress={() => setShowManualInput(!showManualInput)}
                  className="mt-3 flex-row items-center"
                >
                  <Ionicons
                    name={showManualInput ? "chevron-up" : "chevron-down"}
                    size={14}
                    color="rgba(255,255,255,0.4)"
                  />
                  <Text className="ml-1 text-xs text-white/40">
                    Can&apos;t find host? Enter IP manually
                  </Text>
                </Pressable>

                {showManualInput && (
                  <Animated.View
                    entering={FadeInUp.duration(300)}
                    className="mt-3 flex-row items-center gap-2"
                  >
                    <TextInput
                      value={manualIp}
                      onChangeText={setManualIp}
                      placeholder="192.168.1.10"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="numeric"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-main text-sm text-white"
                    />
                    <Pressable
                      onPress={handleManualConnect}
                      className="overflow-hidden rounded-xl"
                    >
                      <LinearGradient
                        colors={["#7C3AED", "#4F46E5"]}
                        className="items-center px-4 py-2"
                      >
                        <Text className="font-main-bold text-xs text-white">
                          CONNECT
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                )}
              </LinearGradient>
            </Animated.View>
          ) : null
        }
      />
    </View>
  );
};
