import React from "react";
import { View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

interface Props {
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
}

export const PermissionCard: React.FC<Props> = ({
  message,
  primaryLabel,
  onPrimary,
}) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 16 }}
      className="overflow-hidden rounded-[30px]"
    >
      {/* 🔥 subtle glow */}
      <View className="absolute inset-0 rounded-[30px] bg-red-500/10 blur-xl" />

      <LinearGradient
        colors={["rgba(239,68,68,0.18)", "rgba(15,23,42,0.22)"]}
        className="rounded-[30px] border border-red-400/20"
      >
        <View className="p-5">
        {/* HEADER */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] uppercase tracking-[3px] text-red-200">
            Permission Needed
          </Text>

          <View className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1">
            <Text className="font-main-bold text-[10px] uppercase tracking-[2px] text-red-100">
              Required
            </Text>
          </View>
        </View>

        {/* TITLE */}
        <Text className="mt-3 font-main-bold text-2xl text-white">
          Allow access to continue
        </Text>

        {/* MESSAGE */}
        <Text className="mt-2 text-sm leading-5 text-white/65">{message}</Text>

        {/* 👇 Helpful explanation */}
        <Text className="mt-3 text-sm leading-5 text-white/55">
          This helps Chor Police find nearby rooms on your Wi-Fi network and
          connect instantly.
        </Text>

        {/* ⚡ Quick fix hint */}
        <View className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <Text className="text-xs text-white/60">
            ⚡ Tip: Make sure both devices are on the same Wi-Fi or hotspot
          </Text>
        </View>

        {/* BUTTON */}
        <Pressable
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPrimary();
          }}
          className="mt-5 overflow-hidden rounded-2xl"
        >
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.96 : 1 }}
              transition={{ duration: 120 }}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                className="rounded-2xl"
              >
                <View className="px-4 py-4">
                <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
                  {primaryLabel}
                </Text>
                </View>
              </LinearGradient>
            </MotiView>
          )}
        </Pressable>
        </View>
      </LinearGradient>
    </MotiView>
  );
};
