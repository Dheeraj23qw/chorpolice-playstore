import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { MotiView } from "moti";
import { rf } from "@/utils/responsive";

export const JoinStepsCard = () => {
  return (
    <View className="mb-5 overflow-hidden rounded-[30px]">
      {/* subtle glow */}
      <View className="absolute inset-0 bg-indigo-500/5 blur-2xl" />

      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
        className="rounded-[30px] border border-white/10 p-5"
      >
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 220 }}
        >
          <View className="gap-3 py-1">
            <View className="flex-row items-center gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <Text className="font-main-bold text-xs text-white">1</Text>
              </View>
              <Text 
                style={{ fontSize: rf(1.6) }}
                className="text-white/80"
              >
                Connect to same Wi-Fi / hotspot
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <Text className="font-main-bold text-xs text-white">2</Text>
              </View>
              <Text 
                style={{ fontSize: rf(1.6) }}
                className="text-white/80"
              >
                Scan QR or enter room code
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <Text className="font-main-bold text-xs text-white">3</Text>
              </View>
              <Text 
                style={{ fontSize: rf(1.6) }}
                className="text-white/80"
              >
                Wait for host to start
              </Text>
            </View>
          </View>
        </MotiView>
      </LinearGradient>
    </View>
  );
};
