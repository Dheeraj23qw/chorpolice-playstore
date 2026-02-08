import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { RotateCcw, Zap, Lock } from "lucide-react-native";
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
      activeOpacity={0.85}
      // Cleaned up logic for class names
      className={`relative mt-4 mb-10 overflow-hidden rounded-[40px] border-2 ${
        isEnabled
          ? "bg-slate-900 border-indigo-500/30"
          : "bg-slate-800 border-slate-700"
      }`}
      style={
        isEnabled
          ? {
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 25,
              elevation: 15, // Essential for Android
            }
          : {}
      }
    >
      {/* LOCK OVERLAY */}
      {isLocked && (
        <View className="absolute inset-0 z-40 items-center justify-center bg-slate-900/90">
          <Lock size={18} color="#94a3b8" />
          <Text className="mt-2 text-[10px] uppercase tracking-[3px] text-slate-400 font-main-bold">
            Unlocks In
          </Text>
          <Text className="mt-1 text-lg font-main-bold text-indigo-400">
            {formattedTime}
          </Text>
        </View>
      )}

      {/* Background Glows */}
      {isEnabled && (
        <>
          <View className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
          <View className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
        </>
      )}

      <View className="flex-row items-center justify-between p-6">
        {/* LEFT SIDE */}
        <View className="z-10 flex-1 pr-4">
          <View className="flex-row items-center mb-1">
            <View
              // Removed animate-pulse (use Reanimated if animation is needed)
              className={`h-2 w-2 rounded-full mr-2 ${
                isEnabled ? "bg-indigo-400" : "bg-slate-500"
              }`}
            />
            <Text
              className={`text-[10px] font-main-bold uppercase tracking-[3px] ${
                isEnabled ? "text-indigo-300" : "text-slate-400"
              }`}
            >
              {isEnabled ? "Daily Bonus" : "Used Today"}
            </Text>
          </View>

          <Text
            style={{ fontSize: rf(2.8) }}
            className={`font-main-bold leading-tight ${
              isEnabled ? "text-white" : "text-slate-400"
            }`}
          >
            Coin Carnival
          </Text>

          {/* Button */}
          <View
            className={`mt-4 flex-row items-center self-start rounded-2xl px-5 py-2.5 ${
              isEnabled
                ? "bg-indigo-500" 
                : "bg-slate-700"
            }`}
          >
            {isEnabled ? (
              <Zap size={14} color="white" fill="white" style={{ marginRight: 8 }} />
            ) : (
              <Lock size={14} color="#94a3b8" style={{ marginRight: 8 }} />
            )}
            <Text
              className={`text-[11px] font-main-bold uppercase tracking-wider ${
                isEnabled ? "text-white" : "text-slate-400"
              }`}
            >
              {isEnabled ? "Play Now" : "Locked"}
            </Text>
          </View>
        </View>

        {/* RIGHT SIDE (Visual Wheel Representation) */}
        <View className="relative items-center justify-center">
          {/* Static dashed border (Removed animate-spin) */}
          <View
            className={`absolute h-40 w-40 rounded-full border border-dashed ${
              isEnabled ? "border-indigo-500/20" : "border-slate-700"
            }`}
          />

          <View
            className={`h-32 w-32 items-center justify-center rounded-full border-[4px] ${
              isEnabled
                ? "bg-indigo-950 border-slate-900"
                : "bg-slate-700 border-slate-800"
            }`}
          >
            {/* Gradient Border Simulation */}
            <View
              className={`absolute inset-0 rounded-full border-[10px] opacity-60 ${
                isEnabled
                  ? "border-t-indigo-500 border-r-blue-500 border-b-indigo-700 border-l-violet-500"
                  : "border-slate-800"
              }`}
            />

            <View className="z-20 h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20">
              <RotateCcw
                size={22}
                color={isEnabled ? "white" : "#64748b"}
                strokeWidth={2.5}
              />
            </View>
          </View>

          {/* Wheel Pointer */}
          <View
            className={`absolute -top-2 z-30 h-5 w-[6px] rounded-full ${
              isEnabled ? "bg-indigo-400" : "bg-slate-600"
            }`}
            style={isEnabled ? { shadowColor: 'white', shadowRadius: 4, shadowOpacity: 0.5 } : {}}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};