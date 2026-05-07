import React, { useEffect, useMemo, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MotiView, MotiText } from "moti";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface Props {
  role: "King" | "Thief" | "Advisor" | "Police" | null;
  round: number;
}

const ROLE_DATA: Record<string, { title: string; color: string; icon: any; subtitle: string }> = {
  King: {
    title: "YOU ARE KING",
    color: "#FACC15",
    icon: require("@/assets/images/chorsipahi/king.webp"),
    subtitle: "Help the Police identify the real thief.",
  },
  Police: {
    title: "YOU ARE POLICE",
    color: "#3B82F6",
    icon: require("@/assets/images/chorsipahi/police.webp"),
    subtitle: "Watch the shuffle carefully and catch the thief.",
  },
  Thief: {
    title: "YOU ARE THIEF",
    color: "#EF4444",
    icon: require("@/assets/images/chorsipahi/thief.webp"),
    subtitle: "Stay hidden. If Police misses, you win the round.",
  },
  Advisor: {
    title: "YOU ARE ADVISOR",
    color: "#10B981",
    icon: require("@/assets/images/chorsipahi/advisor.webp"),
    subtitle: "Protect the secret and avoid suspicion.",
  },
};

const PrivateRevealView = ({ role, round }: Props) => {
  const resolvedRole = role || "Thief";
  const [countdown, setCountdown] = useState(3);
  const data = useMemo(() => ROLE_DATA[resolvedRole], [resolvedRole]);

  useEffect(() => {
    setCountdown(3);
    const timers = [
      setTimeout(() => setCountdown(2), 1000),
      setTimeout(() => setCountdown(1), 2000),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [resolvedRole, round]);

  return (
    <View style={StyleSheet.absoluteFill} className="items-center justify-center">
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 350 }}
        style={StyleSheet.absoluteFill}
      >
        <BlurView intensity={36} tint="dark" style={StyleSheet.absoluteFill} />
      </MotiView>

      <View className="absolute left-0 right-0 top-16 items-center">
        <MotiView
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 14 }}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2"
        >
          <Text className="font-main-bold text-[10px] uppercase tracking-[4px] text-white/70">
            GET SET READY
          </Text>
        </MotiView>

        <MotiText
          key={`${resolvedRole}-${countdown}`}
          from={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          style={{ fontSize: rf(5), color: data.color }}
          className="mt-4 font-main-bold"
        >
          {countdown}
        </MotiText>
      </View>

      <MotiView
        from={{ opacity: 0, scale: 0.86, translateY: 18 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 14 }}
        className="w-[84%] items-center overflow-hidden rounded-[36px] border border-white/15 bg-white/5 p-7"
      >
        <BlurView intensity={16} tint="light" style={StyleSheet.absoluteFill} />

        <View className="absolute -top-16 h-32 w-32 rounded-full opacity-20" style={{ backgroundColor: data.color }} />

        <View className="mb-4 rounded-full border border-white/10 bg-black/30 px-4 py-2">
          <Text className="font-main-bold text-[10px] uppercase tracking-[4px] text-white/70">
            ROUND {round}
          </Text>
        </View>

        <View className="h-[280px] w-full items-center justify-center rounded-[28px] border border-white/10 bg-black/35">
          <Image source={data.icon} style={{ width: "82%", height: "82%" }} resizeMode="contain" />
          <View className="absolute bottom-5 rounded-full border border-white/15 bg-black/45 px-5 py-2">
            <Text style={{ color: data.color }} className="font-main-bold text-sm uppercase tracking-[4px]">
              {resolvedRole}
            </Text>
          </View>
        </View>

        <View className="mt-7 items-center">
          <Text style={{ color: data.color, fontSize: rf(2.4) }} className="font-main-bold uppercase tracking-widest">
            {data.title}
          </Text>
          <Text className="mt-3 text-center font-main text-xs italic text-white/80">
            {data.subtitle}
          </Text>
        </View>
      </MotiView>
    </View>
  );
};

export default PrivateRevealView;
