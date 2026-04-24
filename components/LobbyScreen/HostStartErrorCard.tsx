import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/Text";

interface HostStartErrorCardProps {
  message: string;
  onRetry: () => void;
  onUseReadySeats?: () => void;
  retrying?: boolean;
}

export const HostStartErrorCard: React.FC<HostStartErrorCardProps> = ({
  message,
  onRetry,
  onUseReadySeats,
  retrying = false,
}) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="mx-1 overflow-hidden rounded-[30px]"
  >
    <LinearGradient
      colors={["rgba(245,158,11,0.18)", "rgba(15,23,42,0.2)"]}
      className="rounded-[30px] border border-amber-400/20 p-5"
    >
      <Text className="text-[10px] uppercase tracking-[3px] text-amber-200">
        Room Problem
      </Text>
      <Text className="mt-3 font-main-bold text-2xl text-white">
        Could not open the room
      </Text>
      <Text className="mt-2 text-sm leading-5 text-white/65">{message}</Text>
      <Text className="mt-2 text-sm leading-5 text-white/55">
        Try hosting again. If you only want to play on this phone for now, you
        can still continue with ready seats.
      </Text>

      <Pressable
        onPress={onRetry}
        disabled={retrying}
        className="mt-5 overflow-hidden rounded-2xl active:scale-95"
      >
        <LinearGradient
          colors={
            retrying
              ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
              : ["#2563EB", "#1D4ED8"]
          }
          className="rounded-2xl px-4 py-4"
        >
          <Text
            className={`text-center font-main-bold uppercase tracking-[2px] ${
              retrying ? "text-white/45" : "text-white"
            }`}
          >
            {retrying ? "Trying Again..." : "Try Hosting Again"}
          </Text>
        </LinearGradient>
      </Pressable>

      {onUseReadySeats ? (
        <Pressable
          onPress={onUseReadySeats}
          className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 active:bg-white/10"
        >
          <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
            Play With Ready Seats
          </Text>
        </Pressable>
      ) : null}
    </LinearGradient>
  </MotiView>
);
