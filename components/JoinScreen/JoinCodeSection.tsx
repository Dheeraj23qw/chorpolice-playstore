import React from "react";
import { View, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { MotiView } from "moti";

export const JoinCodeSection = ({
  roomCode,
  setRoomCode,
  onSubmit,
  isConnecting,
}: any) => {
  const formatted = roomCode.toUpperCase();

  return (
    <View className="overflow-hidden rounded-[30px]">
      {/* 🔥 subtle glow */}
      <View className="absolute inset-0 rounded-[30px] bg-indigo-500/10 blur-xl" />

      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
        className="rounded-[30px] border border-white/10 p-5"
      >
        {/* HEADER */}
        <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
          Enter Room Code
        </Text>

        <Text className="mt-2 text-sm text-white/60">
          Ask the host for the code shown next to the QR
        </Text>

        {/* 🔢 CODE INPUT BLOCK */}
        <View className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
          <TextInput
            value={formatted}
            onChangeText={(text) => setRoomCode(text.toUpperCase())}
            autoCapitalize="characters"
            placeholder="C0A8-010A"
            placeholderTextColor="rgba(255,255,255,0.25)"
            editable={!isConnecting}
            className="text-center font-main-bold text-lg tracking-[4px] text-white"
          />
        </View>

        {/* 👇 helper text */}
        <Text className="mt-3 text-center text-xs text-white/40">
          Format: XXXX-XXXX
        </Text>

        {/* 🚀 BUTTON */}
        <Pressable
          onPress={onSubmit}
          disabled={isConnecting}
          className="mt-5 overflow-hidden rounded-2xl"
        >
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.96 : 1 }}
              transition={{ duration: 120 }}
            >
              <LinearGradient
                colors={
                  isConnecting
                    ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"]
                    : ["#2563EB", "#1D4ED8"]
                }
                className="rounded-2xl px-4 py-4"
              >
                <Text
                  className={`text-center font-main-bold uppercase tracking-[2px] ${
                    isConnecting ? "text-white/45" : "text-white"
                  }`}
                >
                  {isConnecting ? "CONNECTING..." : "JOIN ROOM"}
                </Text>
              </LinearGradient>
            </MotiView>
          )}
        </Pressable>
      </LinearGradient>
    </View>
  );
};
