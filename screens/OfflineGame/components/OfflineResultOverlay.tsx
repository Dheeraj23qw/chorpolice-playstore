import React, { memo, useMemo } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Text } from "@/components/Text";
import { playerImages } from "@/constants/playerData";
import { VictoryCelebration } from "@/components/VictoryCelebration";

interface OfflineResultOverlayProps {
  visible: boolean;
  result: { winner: string; points: number[] } | null;
  players: any[];
  roles: string[];
  currentRound: number;
  totalRounds: number;
  onNextRound: () => void;
}

const OfflineResultOverlayComponent: React.FC<OfflineResultOverlayProps> = ({
  visible,
  result,
  players,
  roles,
  currentRound,
  totalRounds,
  onNextRound,
}) => {
  const isFinalRound = useMemo(() => currentRound === totalRounds, [currentRound, totalRounds]);

  if (!result || !visible) return null;

  return (
    <AnimatePresence>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex-1 items-center justify-center bg-black p-6"
      >
        {result.winner === "police" && isFinalRound && (
          <VictoryCelebration type="GOLD" intensity="MEDIUM" duration={4000} />
        )}
        <View className="w-full">
          <MotiView
            from={{ scale: 0.9, opacity: 0, translateY: 20 }}
            animate={{ scale: 1, opacity: 1, translateY: 0 }}
            className="w-full rounded-[40px] border border-white/20 bg-white/5 p-8"
          >
            <Text className="mb-2 text-center font-main-bold text-3xl text-white">
              {result.winner === "police" ? "POLICE WON!" : "THIEF ESCAPED!"}
            </Text>
            <Text className="mb-8 text-center uppercase tracking-[3px] text-white/50">Score Summary</Text>

            <View className="gap-y-4">
              {players.map((p, i) => (
                <View key={i} className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <View className="flex-row items-center">
                    <Image source={playerImages[p.avatarId]?.src || playerImages[1].src} className="mr-3 h-10 w-10 rounded-full" />
                    <View>
                      <Text className="font-main-bold text-white">{p.name || `Player ${i + 1}`}</Text>
                      <Text className="text-[10px] uppercase tracking-widest text-white/40">{roles[i] || "Unknown"}</Text>
                    </View>
                  </View>
                  <Text className="font-main-bold text-lg text-indigo-400">+{result.points[i] || 0}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onNextRound}
              className="mt-10 h-16 w-full items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/40"
            >
              <Text className="font-main-bold text-lg text-white">
                {currentRound < totalRounds ? "Next Round" : "Back to Home"}
              </Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </MotiView>
    </AnimatePresence>
  );
};

export const OfflineResultOverlay = memo(OfflineResultOverlayComponent);
