import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/Text";

interface PermissionFallbackCardProps {
  isHost: boolean;
  onPrimary: () => void;
  onSecondary?: () => void;
  primaryLabel: string;
  message: string;
}

export const PermissionFallbackCard: React.FC<PermissionFallbackCardProps> = ({
  isHost,
  onPrimary,
  onSecondary,
  primaryLabel,
  message,
}) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="mx-1 overflow-hidden rounded-[30px]"
  >
    <LinearGradient
      colors={["rgba(239,68,68,0.18)", "rgba(15,23,42,0.2)"]}
      className="rounded-[30px] border border-red-400/20 p-5"
    >
      <Text className="text-[10px] uppercase tracking-[3px] text-red-200">
        Permission Needed
      </Text>
      <Text className="mt-3 font-main-bold text-2xl text-white">
        Let Chor Police connect
      </Text>
      <Text className="mt-2 text-sm leading-5 text-white/65">{message}</Text>
      <Text className="mt-2 text-sm leading-5 text-white/55">
        If you want to play with friends, make sure you allow Chor Police this
        permission.
      </Text>

      <Pressable onPress={onPrimary} className="mt-5 overflow-hidden rounded-2xl active:scale-95">
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          className="rounded-2xl px-4 py-4"
        >
          <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
            {primaryLabel}
          </Text>
        </LinearGradient>
      </Pressable>

      {isHost && onSecondary ? (
        <Pressable
          onPress={onSecondary}
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
