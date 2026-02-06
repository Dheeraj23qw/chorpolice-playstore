import React, { memo, useEffect, useMemo, useState, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { wp, hp } from "@/utils/responsive";

interface VictoryProps {
  type?: "GOLD" | "THEME";
  duration?: number;
  intensity?: "LOW" | "MEDIUM" | "HIGH";
  onComplete?: () => void;
}

// ⚙️ Robust Configuration
const INTENSITY_CONFIG = {
  LOW: { side: 30, top: 60, surprise: 30 },
  MEDIUM: { side: 50, top: 100, surprise: 60 },
  HIGH: { side: 80, top: 150, surprise: 90 },
};

// Fallback dimensions if utils fail
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const VictoryCelebrationComponent: React.FC<VictoryProps> = ({
  type = "THEME",
  duration = 5000, // Increased slightly for better visual tail-off
  intensity = "MEDIUM",
  onComplete,
}) => {
  const [active, setActive] = useState(true);
  const timerRef = useRef<number | null>(null);

  // 🎨 Palette - Production Tip: Use consistent hex codes from your theme
  const colors = useMemo(() => {
    return type === "GOLD"
      ? ["#FACC15", "#EAB308", "#FFFFFF", "#CA8A04", "#FFD700", "#B45309"]
      : ["#4f46e5", "#9333ea", "#818cf8", "#c084fc", "#ffffff", "#3b82f6"];
  }, [type]);

  const counts = INTENSITY_CONFIG[intensity];

  // 🧹 Robust Lifecycle Management
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setActive(false);
      // Execute onComplete in the next tick to ensure state is settled
      setTimeout(() => onComplete?.(), 0);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onComplete]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {/* 🚀 Layer 1: The Side Cannons (Burst Upwards) */}
      <ConfettiCannon
        count={counts.side}
        origin={{ x: -30, y: hp?.(80) ?? SCREEN_HEIGHT * 0.8 }}
        fadeOut
        explosionSpeed={400}
        fallSpeed={2500}
        colors={colors}
      />
      <ConfettiCannon
        count={counts.side}
        origin={{ x: (wp?.(100) ?? SCREEN_WIDTH) + 30, y: hp?.(80) ?? SCREEN_HEIGHT * 0.8 }}
        fadeOut
        explosionSpeed={400}
        fallSpeed={2500}
        colors={colors}
      />

      {/* 🚀 Layer 2: The Rainfall (Continuous feel) */}
      {intensity !== "LOW" && (
        <ConfettiCannon
          count={counts.top}
          origin={{ x: wp?.(50) ?? SCREEN_WIDTH / 2, y: -50 }}
          fadeOut
          fallSpeed={3500}
          explosionSpeed={350}
          colors={colors}
        />
      )}

      {/* 🚀 Layer 3: The Center Surprise (Delayed) */}
      <ConfettiCannon
        count={counts.surprise}
        origin={{ x: wp?.(50) ?? SCREEN_WIDTH / 2, y: hp?.(40) ?? SCREEN_HEIGHT * 0.4 }}
        autoStartDelay={800} // Shorter delay for tighter feel
        fadeOut
        fallSpeed={2200}
        colors={colors}
      />
    </View>
  );
};

// Use memo with a custom comparison if props change frequently
export const VictoryCelebration = memo(VictoryCelebrationComponent);

const styles = StyleSheet.create({
    // Using StyleSheet instead of raw objects is slightly more performant in RN
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    }
});