import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { hp, wp, rf } from "@/utils/responsive";

interface TimerProps {
  /** Current time in seconds */
  countdown: number;
  /** Optional style override for the container */
  containerStyle?: object;
}

const Timer: React.FC<TimerProps> = ({ countdown, containerStyle }) => {
  // 1. Determine State Thresholds
  const isDanger = countdown <= 5;
  const isWarning = countdown <= 10 && countdown > 5;

  // 2. Memoize Style Mappings 
  // This prevents recalculating these strings on every single second tick
  // unless the threshold status actually changes.
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

  // 3. Format Time (e.g., 5 -> "05")
  const formattedTime = countdown < 10 && countdown >= 0 ? `0${countdown}` : countdown;

  return (
    <View 
      style={[{ height: hp(18) }, containerStyle]} 
      className="items-center justify-center"
      accessible={true}
      accessibilityRole="timer"
      accessibilityLabel={`Time remaining: ${countdown} seconds`}
      accessibilityLiveRegion="polite"
    >
      
      {/* 1. Ambient Glow - Optimized with native blur when possible */}
      <View 
        style={[
          { width: wp(40), height: wp(40) },
          // Note: blur-3xl can be heavy on some Android devices
          Platform.OS === 'android' ? { elevation: 0 } : null 
        ]}
        className={`absolute rounded-full blur-3xl ${theme.bg} ${theme.glowOpacity}`}
      />

      {/* 2. Main Outer Shell */}
      <View 
        style={{ width: wp(28), height: wp(28) }}
        className="items-center justify-center rounded-full bg-[#0d0d0f] border border-white/10 shadow-2xl"
      >
        
        {/* 3. The Tech Ring */}
        <View 
          style={{ width: wp(23), height: wp(23) }}
          className={`rounded-full items-center justify-center border-2 border-dashed ${theme.border} opacity-80`}
        >
          
          {/* 4. Content Area */}
          <View className="items-center justify-center">
            <Text 
              style={{ fontSize: rf(1.1) }} 
              className={`font-bold uppercase tracking-[2px] mb-[-4px] ${theme.text}`}
            >
              Remaining
            </Text>
            
            <Text 
              style={styles.timerText} 
              className="font-black text-white tabular-nums"
            >
              {formattedTime}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. Warning Label - Absolute Positioning to prevent layout jumps */}
      <View className="absolute -bottom-1 items-center justify-center w-full h-8">
        {(isDanger || isWarning) && (
          <View className={`px-4 py-1 rounded-full border border-white/5 ${theme.badge}`}>
            <Text 
              style={{ fontSize: rf(1) }} 
              className={`font-black uppercase tracking-[2.5px] ${theme.label}`}
            >
              {isDanger ? "• Critical •" : "Warning"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Use StyleSheet for static complex values to keep the render path clean
const styles = StyleSheet.create({
  timerText: {
    fontSize: rf(5),
    lineHeight: rf(6),
    // Ensure numbers don't jump horizontally as they change
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
});

export default memo(Timer);