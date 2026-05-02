import React, { useRef, useState } from "react";
import { View, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { MotiView, AnimatePresence } from "moti";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  const [showPortInput, setShowPortInput] = useState(false);

  // Parse current roomCode: "055" or "055-236"
  const parts = roomCode.split("-");
  const mainDigits = [
    parts[0]?.[0] || "",
    parts[0]?.[1] || "",
    parts[0]?.[2] || "",
  ];
  const portSuffix = parts[1] || "";

  const mainRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  const portRef = useRef<TextInput>(null);

  const buildCode = (digits: string[], port: string) => {
    const main = digits.join("");
    if (port.length > 0) return `${main}-${port}`;
    return main;
  };

  const handleDigitChange = (text: string, index: number) => {
    const char = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...mainDigits];
    next[index] = char;
    setRoomCode(buildCode(next, portSuffix));
    if (char && index < 2) mainRefs[index + 1].current?.focus();
    else if (char && index === 2 && showPortInput) portRef.current?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      mainDigits[index] === "" &&
      index > 0
    ) {
      const next = [...mainDigits];
      next[index - 1] = "";
      setRoomCode(buildCode(next, portSuffix));
      mainRefs[index - 1].current?.focus();
    }
  };

  const handlePortChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "").slice(0, 3);
    setRoomCode(buildCode(mainDigits, clean));
  };

  const togglePortInput = () => {
    if (showPortInput) {
      // Clear port suffix when hiding
      setRoomCode(buildCode(mainDigits, ""));
    }
    setShowPortInput((v) => !v);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const mainCode = mainDigits.join("");
  const isReady =
    mainCode.length === 3 && (!showPortInput || portSuffix.length === 3);

  return (
    <View className="overflow-hidden rounded-[30px]">
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
          Ask the host for the 3-digit code shown on their screen
        </Text>

        {/* 3-BOX OTP INPUT */}
        <View className="mt-6 flex-row items-center justify-center gap-4">
          {[0, 1, 2].map((index) => (
            <MotiView
              key={index}
              animate={{
                scale: mainDigits[index] ? 1.08 : 1,
                borderColor: mainDigits[index]
                  ? "rgba(99,102,241,0.9)"
                  : "rgba(255,255,255,0.12)",
              }}
              transition={{ type: "spring", damping: 18 }}
              style={{
                width: 72,
                height: 80,
                borderRadius: 16,
                borderWidth: 1.5,
                backgroundColor: "rgba(0,0,0,0.4)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextInput
                ref={mainRefs[index]}
                value={mainDigits[index]}
                onChangeText={(t) => handleDigitChange(t, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!isConnecting}
                selectTextOnFocus
                caretHidden
                style={{
                  color: "white",
                  fontSize: 36,
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "100%",
                  height: "100%",
                  letterSpacing: 2,
                }}
              />
            </MotiView>
          ))}

          {/* PORT SUFFIX — optional */}
          <AnimatePresence>
            {showPortInput && (
              <MotiView
                from={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", damping: 18 }}
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text className="font-main-bold text-lg text-white/40">-</Text>
                <View
                  style={{
                    width: 68,
                    height: 80,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor:
                      portSuffix.length === 3
                        ? "rgba(99,102,241,0.9)"
                        : "rgba(255,255,255,0.12)",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TextInput
                    ref={portRef}
                    value={portSuffix}
                    onChangeText={handlePortChange}
                    keyboardType="number-pad"
                    maxLength={3}
                    editable={!isConnecting}
                    placeholder="236"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    style={{
                      color: "white",
                      fontSize: 22,
                      fontWeight: "bold",
                      textAlign: "center",
                      width: "100%",
                      height: "100%",
                      letterSpacing: 1,
                    }}
                  />
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        {/* PORT TOGGLE */}
        <Pressable
          onPress={togglePortInput}
          className="mt-3 flex-row items-center justify-center gap-1 self-center"
        >
          <MaterialCommunityIcons
            name={showPortInput ? "chevron-up" : "tune-variant"}
            size={12}
            color="rgba(255,255,255,0.3)"
          />
        </Pressable>

        <Text className="mt-2 text-center text-[10px] text-white/20">
          Both devices must be on the same WiFi
        </Text>

        {/* JOIN BUTTON */}
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
              transition={{ duration: 120 }}
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
