import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { MotiView } from "moti";

export const JoinStepsCard = ({ connectionCopy }: any) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <View className="mb-5 overflow-hidden rounded-[30px]">
      {/* 🔥 subtle glow */}
      <View className="absolute inset-0 bg-indigo-500/5 blur-2xl" />

      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
        className="rounded-[30px] border border-white/10 p-5"
      >
        {/* CONTENT SWITCH */}
        <MotiView
          key={showHelp ? "help" : "steps"}
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 220 }}
        >
          {!showHelp ? (
            <>
              {/* STEPS */}
              <View className="mt-3 gap-2">
                <Text className="text-white">
                  ① Connect to same Wi-Fi / hotspot
                </Text>
                <Text className="text-white">② Scan QR or enter room code</Text>
                <Text className="text-white">③ Wait for host to start</Text>
              </View>
            </>
          ) : (
            <View className="mt-3 gap-4">
              {/* SECTION */}
              <View>
                <Text className="text-[11px] uppercase tracking-[2px] text-white/40">
                  Connection Issues
                </Text>

                <View className="mt-2 gap-1">
                  <Text className="text-sm text-white/70">
                    • Same Wi-Fi or hotspot required
                  </Text>
                  <Text className="text-sm text-white/70">
                    • Avoid public Wi-Fi (blocked LAN)
                  </Text>
                  <Text className="text-sm text-white/70">
                    • Turn off mobile data
                  </Text>
                </View>
              </View>

              {/* SECTION */}
              <View>
                <Text className="text-[11px] uppercase tracking-[2px] text-white/40">
                  QR Not Working
                </Text>

                <View className="mt-2 gap-1">
                  <Text className="text-sm text-white/70">
                    • Move closer and align properly
                  </Text>
                  <Text className="text-sm text-white/70">
                    • Increase host screen brightness
                  </Text>
                  <Text className="text-sm text-white/70">
                    • Use room code instead
                  </Text>
                </View>
              </View>

              {/* SECTION */}
              <View>
                <Text className="text-[11px] uppercase tracking-[2px] text-white/40">
                  Code Issues
                </Text>

                <View className="mt-2 gap-1">
                  <Text className="text-sm text-white/70">
                    • Enter exactly (check dashes)
                  </Text>
                  <Text className="text-sm text-white/70">
                    • Ask host to reopen room
                  </Text>
                  <Text className="text-sm text-white/70">
                    • Ensure host is still active
                  </Text>
                </View>
              </View>

              {/* QUICK FIX CARD */}
              <View className="rounded-xl border border-indigo-400/20 bg-indigo-400/10 px-4 py-3">
                <Text className="text-xs text-indigo-100">
                  ⚡ Quick fix: Restart Wi-Fi on both devices
                </Text>
              </View>
            </View>
          )}
        </MotiView>

        {/* BUTTON */}
        <Pressable onPress={() => setShowHelp((p) => !p)}>
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.97 : 1 }}
              className="mt-5 overflow-hidden rounded-xl"
            >
              <LinearGradient
                colors={
                  showHelp
                    ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.05)"]
                    : ["rgba(99,102,241,0.35)", "rgba(79,70,229,0.2)"]
                }
                className="rounded-xl border border-white/10 px-4 py-3"
              >
                <Text className="text-center font-main-bold text-xs uppercase tracking-[2px] text-white/80">
                  {showHelp ? "Back to Steps" : "Need Help?"}
                </Text>
              </LinearGradient>
            </MotiView>
          )}
        </Pressable>
      </LinearGradient>
    </View>
  );
};
