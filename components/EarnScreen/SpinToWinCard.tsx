import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Zap, Lock, Sparkles } from "lucide-react-native";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface SpinCardProps {
  isLocked: boolean;
  formattedTime: string;
  onPress: () => void;
}

export const SpinToWinCard = ({
  isLocked,
  formattedTime,
  onPress,
}: SpinCardProps) => {
  const isEnabled = !isLocked;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.88}
      className={`relative mb-10 mt-4 overflow-hidden rounded-[36px] border-2 ${
        isEnabled
          ? "border-amber-400/90 bg-zinc-950"
          : "border-slate-800 bg-slate-900"
      }`}
      style={
        isEnabled
          ? {
              shadowColor: "#F59E0B",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.45,
              shadowRadius: 24,
              elevation: 16,
            }
          : {}
      }
    >
      {/* RICH GOLDEN GRADIENT BACKDROP */}
      {isEnabled && (
        <LinearGradient
          colors={["#34220F", "#1A1006", "#32200E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* GLASS REFLECTION OVERLAY */}
      {isEnabled && (
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.14)",
            "rgba(255,255,255,0.03)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* LOCK OVERLAY */}
      {isLocked && (
        <View className="absolute inset-0 z-40 items-center justify-center bg-slate-950/90">
          <Lock size={20} color="#94a3b8" />
          <Text className="mt-2 font-main-bold text-[10px] uppercase tracking-[3px] text-slate-400">
            Unlocks In
          </Text>
          <Text className="mt-1 font-main-bold text-lg text-amber-400">
            {formattedTime}
          </Text>
        </View>
      )}

      {/* Background Glows */}
      {isEnabled && (
        <>
          <View className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-amber-500/25 blur-3xl" />
          <View className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-amber-300/15 blur-2xl" />
        </>
      )}

      <View className="flex-row items-center justify-between p-6">
        {/* LEFT SIDE */}
        <View className="z-10 flex-1 pr-4">
          <View className="mb-1 flex-row items-center">
            <View
              className={`mr-2 h-2.5 w-2.5 rounded-full ${
                isEnabled ? "bg-amber-400 shadow-[0_0_10px_#F59E0B]" : "bg-slate-500"
              }`}
            />
            <Text
              className={`font-main-bold text-[10px] uppercase tracking-[3px] ${
                isEnabled ? "text-amber-300" : "text-slate-400"
              }`}
            >
              {isEnabled ? "✨ Daily Bonus" : "Used Today"}
            </Text>
          </View>

          <Text
            style={{ fontSize: rf(2.8) }}
            className={`font-main-bold leading-tight ${
              isEnabled ? "text-amber-100" : "text-slate-400"
            }`}
          >
            Coin Carnival
          </Text>

          {/* Golden Underline */}
          {isEnabled && (
            <View className="mt-2 h-[2px] w-14 rounded-full bg-gradient-to-r bg-amber-400" />
          )}

          {/* Golden Play Button */}
          <View
            className={`mt-4 flex-row items-center self-start overflow-hidden rounded-2xl border px-5 py-2.5 ${
              isEnabled
                ? "border-amber-300/60 bg-amber-500 shadow-md shadow-amber-500/50"
                : "bg-slate-700"
            }`}
          >
            {isEnabled && (
              <LinearGradient
                colors={["#FBBF24", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            )}
            {isEnabled ? (
              <Zap
                size={14}
                color="#78350F"
                fill="#78350F"
                style={{ marginRight: 8 }}
              />
            ) : (
              <Lock size={14} color="#94a3b8" style={{ marginRight: 8 }} />
            )}
            <Text
              className={`font-main-bold text-[11px] uppercase tracking-wider ${
                isEnabled ? "text-[#451A03]" : "text-slate-400"
              }`}
            >
              {isEnabled ? "Play Now" : "Locked"}
            </Text>
          </View>
        </View>

        {/* RIGHT SIDE (Custom Spin Wheel Image with Double Gold Rings & Sparkle Badge) */}
        <View className="relative h-36 w-36 items-center justify-center">
          {/* Outer Decorative Ring */}
          {isEnabled && (
            <View className="absolute h-[142px] w-[142px] rounded-full border border-dashed border-amber-400/40" />
          )}

          {/* Wheel Image Container */}
          <View
            style={{ width: 128, height: 128 }}
            className={`overflow-hidden rounded-full border-2 ${
              isEnabled ? "border-amber-300 shadow-lg shadow-amber-500/60" : "border-slate-700"
            }`}
          >
            <Image
              source={require("@/assets/modalImages/spin_wheel.webp")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
              className={isEnabled ? "opacity-100" : "opacity-35"}
            />
          </View>

          {/* Sparkle Badge */}
          {isEnabled && (
            <View className="absolute -top-1 -right-1 h-7 w-7 items-center justify-center rounded-full border border-amber-300/60 bg-amber-500/90 shadow-md">
              <Sparkles size={13} color="#78350F" strokeWidth={2.5} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
