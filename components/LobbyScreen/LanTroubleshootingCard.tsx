import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

export const LanTroubleshootingCard: React.FC = () => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500 }}
      className="rounded-2xl border border-white/5 bg-white/5"
    >
      <View className="mt-6 w-full p-5">
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name="bulb-outline" size={rf(1.8)} color="#93c5fd" />
        <Text style={{ fontSize: rf(1.4) }} className="font-main-bold uppercase tracking-wider text-blue-300">
          Not working?
        </Text>
      </View>

      <View className="gap-2">
        <View className="flex-row items-start gap-2">
          <View className="mt-1.5 h-1 w-1 rounded-full bg-white/30" />
          <Text style={{ fontSize: rf(1.35) }} className="font-main-md text-white/60 flex-1">
            All players must be on same Hotspot
          </Text>
        </View>
        <View className="flex-row items-start gap-2">
          <View className="mt-1.5 h-1 w-1 rounded-full bg-white/30" />
          <Text style={{ fontSize: rf(1.35) }} className="font-main-md text-white/60 flex-1">
            Turn OFF mobile data
          </Text>
        </View>
        <View className="flex-row items-start gap-2">
          <View className="mt-1.5 h-1 w-1 rounded-full bg-white/30" />
          <Text style={{ fontSize: rf(1.35) }} className="font-main-md text-white/60 flex-1">
            Restart your Hotspot
          </Text>
        </View>
      </View>
      </View>

    </MotiView>
  );
};
