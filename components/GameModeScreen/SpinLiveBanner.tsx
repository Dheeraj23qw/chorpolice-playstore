import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { useAppSelector } from "@/hooks/useAppRedux";
import { SPIN_COOLDOWN_MS } from "@/constants/spinwheel";
import { formatTime } from "@/utils/TimeFormat";

export const SpinLiveBanner: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState(0);
  const spinLock = useAppSelector((s) => s.lock.spin);
  const COOLDOWN_MS = SPIN_COOLDOWN_MS;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const lastUsed = spinLock.lastUsedTimestamp;

    if (lastUsed !== null) {
      const updateRemaining = () => {
        const diff = COOLDOWN_MS - (Date.now() - lastUsed);
        setRemainingTime(diff > 0 ? diff : 0);
      };
      updateRemaining();
      interval = setInterval(updateRemaining, 1000);
    } else {
      setRemainingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [spinLock.lastUsedTimestamp]);

  // 🚀 Hide bottom banner while spin is live (since giant Spin card is active at top)
  if (remainingTime === 0) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      className="mx-6 mb-3 overflow-hidden rounded-full border border-white/15 bg-slate-950/70 shadow-2xl"
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View className="flex-row items-center justify-between px-5 py-2.5">
        {/* SMALL ELEGANT IMAGE THUMBNAIL */}
        <View className="relative h-9 w-9 overflow-hidden rounded-full border border-amber-400/40 bg-zinc-900 shadow-md">
          <Image
            source={require("@/assets/images/chorsipahi/king.webp")}
            className="h-full w-full opacity-90"
            resizeMode="cover"
          />
        </View>

        {/* ELEGANT COUNTDOWN TEXT */}
        <View className="ml-3 flex-1">
          <Text className="font-main-bold text-[9px] uppercase tracking-[2.5px] text-amber-400/90">
            NEXT SPIN LOCKED
          </Text>
          <Text className="font-main-bold text-xs tracking-wider text-white">
            Unlocks in <Text className="text-yellow-300">{formatTime(remainingTime)}</Text>
          </Text>
        </View>
      </View>
    </MotiView>
  );
};

export default React.memo(SpinLiveBanner);
