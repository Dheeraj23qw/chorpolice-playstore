import React, { memo, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { wp, hp } from "@/utils/responsive";

interface VictoryProps {
  type?: "GOLD" | "THEME";
  duration?: number; // total celebration duration
  intensity?: "LOW" | "MEDIUM" | "HIGH";
  onComplete?: () => void;
}

const INTENSITY_CONFIG = {
  LOW: { side: 40, top: 80, surprise: 50 },
  MEDIUM: { side: 70, top: 130, surprise: 90 },
  HIGH: { side: 100, top: 180, surprise: 120 },
};

const VictoryCelebrationComponent: React.FC<VictoryProps> = ({
  type = "THEME",
  duration = 4500,
  intensity = "MEDIUM",
  onComplete,
}) => {
  const [active, setActive] = useState(true);

  // 🎨 Memoized colors
  const colors = useMemo(() => {
    return type === "GOLD"
      ? ["#FACC15", "#EAB308", "#FFFFFF", "#CA8A04", "#FFD700"]
      : ["#4f46e5", "#9333ea", "#818cf8", "#c084fc", "#ffffff", "#3b82f6"];
  }, [type]);

  const counts = INTENSITY_CONFIG[intensity];

  // 🧹 Auto cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!active) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {/* Bottom Left */}
      <ConfettiCannon
        count={counts.side}
        origin={{ x: -20, y: hp(80) }}
        fadeOut
        explosionSpeed={500}
        fallSpeed={2500}
        colors={colors}
      />

      {/* Bottom Right */}
      <ConfettiCannon
        count={counts.side}
        origin={{ x: wp(100) + 20, y: hp(80) }}
        fadeOut
        explosionSpeed={500}
        fallSpeed={2500}
        colors={colors}
      />

      {/* Top Grand Burst */}
      <ConfettiCannon
        count={counts.top}
        origin={{ x: wp(50), y: -20 }}
        fadeOut
        fallSpeed={4000}
        explosionSpeed={300}
        colors={colors}
      />

      {/* Delayed Surprise */}
      <ConfettiCannon
        count={counts.surprise}
        origin={{ x: wp(50), y: hp(40) }}
        autoStartDelay={1000}
        fadeOut
        fallSpeed={2000}
        colors={colors}
      />
    </View>
  );
};

export const VictoryCelebration = memo(VictoryCelebrationComponent);
