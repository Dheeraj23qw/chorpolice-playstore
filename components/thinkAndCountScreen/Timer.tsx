import React, { memo, useMemo } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "../Text";

interface TimerProps {
  countdown: number;
  containerStyle?: object;
  variant?: "default" | "compact";
}

const Timer: React.FC<TimerProps> = ({ countdown, containerStyle, variant = "default" }) => {
  const isDanger = countdown <= 5;
  const isWarning = countdown <= 10 && countdown > 5;

  const theme = useMemo(() => {
    if (isDanger) {
      return {
        text: "text-red-500",
        border: "border-red-500",
        bg: "bg-red-500",
        label: "text-red-400",
        badge: "bg-red-500/20",
        glowOpacity: "opacity-25",
        status: "CRITICAL",
      };
    }
    if (isWarning) {
      return {
        text: "text-amber-500",
        border: "border-amber-500",
        bg: "bg-amber-500",
        label: "text-amber-400",
        badge: "bg-amber-500/20",
        glowOpacity: "opacity-15",
        status: "WARNING",
      };
    }
    return {
      text: "text-indigo-500",
      border: "border-indigo-500",
      bg: "bg-indigo-500",
      label: "text-indigo-400",
      badge: "bg-indigo-500/10",
      glowOpacity: "opacity-10",
      status: "STABLE",
    };
  }, [isDanger, isWarning]);

  const formattedTime = countdown < 10 && countdown >= 0 ? `0${countdown}` : countdown;
  const isCompact = variant === "compact";
  const shellSize = isCompact ? wp(17) : wp(28);
  const ringSize = isCompact ? wp(13.5) : wp(23);
  const glowSize = isCompact ? wp(24) : wp(40);

  return (
    <View 
      style={[{ height: isCompact ? hp(9) : hp(18), width: isCompact ? wp(19) : undefined }, containerStyle]}
      className="items-center justify-center"
      accessible={true}
      accessibilityRole="timer"
    >
      {/* 1. Ambient Glow - Provides the "emergency" lighting feel */}
      <View 
        style={[{ width: glowSize, height: glowSize }]}
        className={`absolute rounded-full blur-3xl ${theme.bg} ${theme.glowOpacity}`}
      />

      {/* 2. Main Outer Shell */}
      <View 
        style={{ width: shellSize, height: shellSize }}
        className="items-center justify-center rounded-full bg-[#0d0d0f] border border-white/10 shadow-2xl"
      >
        
        {/* 3. The Tech Ring (Dashed border adds a mechanical vibe) */}
        <View 
          style={{ width: ringSize, height: ringSize }}
          className={`rounded-full items-center justify-center border-2 border-dashed ${theme.border} opacity-80`}
        >
          
          <View className="items-center justify-center">
            <Text
              style={{ fontSize: isCompact ? rf(0.7) : rf(1.1) }}
              // Shielded typography for the secondary label
              className={`font-main-bold uppercase tracking-[2px] mb-[-4px] ${theme.text}`}
            >
              Remaining
            </Text>
            
            <Text
              style={[styles.timerText, isCompact && styles.compactTimerText]}
              // Large display for the actual countdown
              className="font-main-bold text-white"
            >
              {formattedTime}
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Warning Label - Only appears when time is low */}
      <View className="absolute -bottom-1 items-center justify-center w-full h-8">
        {!isCompact && (isDanger || isWarning) && (
          <View className={`px-4 py-1 rounded-full border border-white/5 ${theme.badge}`}>
            <Text 
              style={{ fontSize: rf(1) }} 
              className={`font-main-bold uppercase tracking-[2.5px] ${theme.label}`}
            >
              {isDanger ? "• Critical •" : "Warning"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerText: {
    fontSize: rf(5),
    lineHeight: rf(6),
    // Tabular numbers prevent the "dancing digits" effect during countdown
    fontVariant: ['tabular-nums'], 
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  compactTimerText: {
    fontSize: rf(3.1),
    lineHeight: rf(3.5),
  },
});

export default memo(Timer);
