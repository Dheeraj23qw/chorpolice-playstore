import React, { useRef } from "react";
import { View, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { rf } from "@/utils/responsive";

interface JoinCodeSectionProps {
  roomCode: string;
  setRoomCode: (code: string) => void;
  onSubmit: () => void;
  isConnecting: boolean;
}

export const JoinCodeSection = ({
  roomCode,
  setRoomCode,
  onSubmit,
  isConnecting,
}: JoinCodeSectionProps) => {
  const digits = [
    roomCode[0] || "",
    roomCode[1] || "",
    roomCode[2] || "",
  ];

  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleDigitChange = (text: string, index: number) => {
    const char = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setRoomCode(next.join(""));
    if (char && index < 2) refs[index + 1].current?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && digits[index] === "" && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setRoomCode(next.join(""));
      refs[index - 1].current?.focus();
    }
  };

  const isReady = digits.every((d) => d !== "");

  return (
    <View className="overflow-hidden rounded-[28px]">
      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
        className="rounded-[28px] border border-white/10 p-5"
      >
        {/* Header */}
        <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
          Enter Room Code
        </Text>
        <Text className="mt-2 text-sm text-white/60">
          Ask the host for the 3-digit code shown on their screen
        </Text>

        {/* 3-box OTP */}
        <View className="mt-6 flex-row items-center justify-center gap-4">
          {[0, 1, 2].map((index) => (
            <MotiView
              key={index}
              animate={{
                scale: digits[index] ? 1.06 : 1,
                borderColor: digits[index]
                  ? "rgba(99,102,241,0.9)"
                  : "rgba(255,255,255,0.12)",
              }}
              transition={{ type: "spring", damping: 18 }}
              style={{
                width: 80,
                height: 88,
                borderRadius: 18,
                borderWidth: 1.5,
                backgroundColor: "rgba(0,0,0,0.4)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextInput
                ref={refs[index]}
                value={digits[index]}
                onChangeText={(t) => handleDigitChange(t, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!isConnecting}
                selectTextOnFocus
                caretHidden
                style={{
                  color: "white",
                  fontSize: 40,
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "100%",
                  height: "100%",
                  letterSpacing: 2,
                }}
              />
            </MotiView>
          ))}
        </View>

        <Text className="mt-4 text-center text-[10px] text-white/20">
          Both devices must be on the same WiFi or hotspot
        </Text>

        {/* Join button */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSubmit();
          }}
          disabled={isConnecting || !isReady}
          className="mt-5 overflow-hidden rounded-2xl"
        >
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.96 : 1 }}
              transition={{ duration: 100 }}
            >
              <LinearGradient
                colors={
                  isConnecting || !isReady
                    ? ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.05)"]
                    : ["#4F46E5", "#2563EB"]
                }
                className="rounded-2xl px-4 py-4"
              >
                <Text
                  style={{ fontSize: rf(1.8) }}
                  className={`text-center font-main-bold uppercase tracking-[2px] ${
                    isConnecting || !isReady ? "text-white/35" : "text-white"
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
