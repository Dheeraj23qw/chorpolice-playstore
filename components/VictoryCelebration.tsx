import React, { memo, useEffect, useMemo, useState, useRef } from "react";
import { View, Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { wp, hp } from "@/utils/responsive";

interface VictoryProps {
  visible?: boolean; // Added for better control from parent
  type?: "GOLD" | "THEME";
  duration?: number;
  intensity?: "LOW" | "MEDIUM" | "HIGH";
  onComplete?: () => void;
}

const INTENSITY_CONFIG = {
  LOW: { side: 30, top: 60, surprise: 30 },
  MEDIUM: { side: 50, top: 100, surprise: 60 },
  HIGH: { side: 80, top: 150, surprise: 90 },
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const VictoryCelebrationComponent: React.FC<VictoryProps> = ({
  visible = true,
  type = "THEME",
  duration = 5000,
  intensity = "MEDIUM",
  onComplete,
}) => {
  const [active, setActive] = useState(visible);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const colors = useMemo(() => {
    return type === "GOLD"
      ? ["#FACC15", "#EAB308", "#FFFFFF", "#CA8A04", "#FFD700", "#B45309"]
      : ["#4f46e5", "#9333ea", "#818cf8", "#c084fc", "#ffffff", "#3b82f6"];
  }, [type]);

  const counts = INTENSITY_CONFIG[intensity];

  useEffect(() => {
    if (visible) {
      setActive(true);
      timerRef.current = setTimeout(() => {
        setActive(false);
        // Execute onComplete after the confetti starts fading
        onComplete?.();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, duration, onComplete]);

  if (!active || !visible) return null;

  return (
    // ✅ Replaced StyleSheet.absoluteFillObject with NativeWind classes
    <View 
      pointerEvents="none" 
      className="absolute inset-0 z-[999]"
    >
      {/* 🚀 Layer 1: The Side Cannons */}
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

      {/* 🚀 Layer 2: The Rainfall */}
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

      {/* 🚀 Layer 3: The Center Surprise */}
      <ConfettiCannon
        count={counts.surprise}
        origin={{ x: wp?.(50) ?? SCREEN_WIDTH / 2, y: hp?.(40) ?? SCREEN_HEIGHT * 0.4 }}
        autoStartDelay={800}
        fadeOut
        fallSpeed={2200}
        colors={colors}
      />
    </View>
  );
};

export const VictoryCelebration = memo(VictoryCelebrationComponent);