import React, { memo, useEffect, useMemo, useState, useRef } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { wp, hp } from "@/utils/responsive";

interface VictoryProps {
  type?: "GOLD" | "THEME";
  duration?: number;
  intensity?: "LOW" | "MEDIUM" | "HIGH";
  onComplete?: () => void;
}

// ✅ Predefined intensity config for all layers
const INTENSITY_CONFIG = {
  LOW: { side: 30, top: 0, surprise: 20 },
  MEDIUM: { side: 50, top: 100, surprise: 60 },
  HIGH: { side: 80, top: 150, surprise: 90 },
};

// Fallback dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const VictoryCelebrationComponent: React.FC<VictoryProps> = ({
  type = "THEME",
  duration = 5000,
  intensity = "MEDIUM",
  onComplete,
}) => {
  const [active, setActive] = useState(true);
  const timerRef = useRef<number | null>(null);

  // 🎨 Memoized colors
  const colors = useMemo(() => {
    return type === "GOLD"
      ? ["#FACC15", "#EAB308", "#FFFFFF", "#CA8A04", "#FFD700", "#B45309"]
      : ["#4f46e5", "#9333ea", "#818cf8", "#c084fc", "#ffffff", "#3b82f6"];
  }, [type]);

  const counts = useMemo(() => INTENSITY_CONFIG[intensity], [intensity]);

  // 🧹 Timer & cleanup
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setActive(false);
      setTimeout(() => onComplete?.(), 0);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onComplete]);

  if (!active) return null;

  // Memoized origin points
  const origins = useMemo(
    () => ({
      leftSide: { x: -30, y: hp?.(80) ?? SCREEN_HEIGHT * 0.8 },
      rightSide: { x: (wp?.(100) ?? SCREEN_WIDTH) + 30, y: hp?.(80) ?? SCREEN_HEIGHT * 0.8 },
      topCenter: { x: wp?.(50) ?? SCREEN_WIDTH / 2, y: -50 },
      centerSurprise: { x: wp?.(50) ?? SCREEN_WIDTH / 2, y: hp?.(40) ?? SCREEN_HEIGHT * 0.4 },
    }),
    []
  );

  return (
    <View pointerEvents="none" style={styles.container}>
      {/* Side Cannons */}
      <ConfettiCannon
        count={counts.side}
        origin={origins.leftSide}
        fadeOut
        explosionSpeed={400}
        fallSpeed={2500}
        colors={colors}
      />
      <ConfettiCannon
        count={counts.side}
        origin={origins.rightSide}
        fadeOut
        explosionSpeed={400}
        fallSpeed={2500}
        colors={colors}
      />

      {/* Top Rainfall */}
      {intensity !== "LOW" && counts.top > 0 && (
        <ConfettiCannon
          count={counts.top}
          origin={origins.topCenter}
          fadeOut
          explosionSpeed={350}
          fallSpeed={3500}
          colors={colors}
        />
      )}

      {/* Center Surprise */}
      <ConfettiCannon
        count={counts.surprise}
        origin={origins.centerSurprise}
        autoStartDelay={800}
        fadeOut
        fallSpeed={2200}
        colors={colors}
      />
    </View>
  );
};

// Custom memoization: only re-render if relevant props change
export const VictoryCelebration = memo(
  VictoryCelebrationComponent,
  (prev, next) =>
    prev.type === next.type &&
    prev.duration === next.duration &&
    prev.intensity === next.intensity &&
    prev.onComplete === next.onComplete
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
});
