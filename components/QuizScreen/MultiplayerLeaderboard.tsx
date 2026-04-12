import React from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { rf, hp, wp } from "@/utils/responsive";
import { playerImages } from "@/constants/playerData";

interface LeaderboardItem {
  id: string;
  name: string;
  avatarId: number; // ✅ Added for avatar sync
  score: number;
  lastRoundTime: number;
  totalTime: number;
  submissionTime?: string;
}

interface MultiplayerLeaderboardProps {
  round: number;
  data: LeaderboardItem[];
  onNext: () => void;
  isHost: boolean;
  isLastRound: boolean;
  totalPot: number;
}

export const MultiplayerLeaderboard: React.FC<MultiplayerLeaderboardProps> = ({
  round,
  data,
  onNext,
  isHost,
  isLastRound,
  totalPot,
}) => {
  if (!data) return null;

  const getAvatarSource = (avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData ? imgData.src : require("@/assets/images/chorsipahi/kid1.png");
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 500 }}
      className="flex-1 px-4"
    >
      <View className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-3xl">
        {/* Header Section core */}
        <View className="bg-indigo-600/20 px-6 py-6 items-center">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 mb-3">
             <Ionicons name="trophy" size={24} color="#818cf8" />
          </View>
          <Text className="font-main-bold text-[10px] uppercase tracking-[5px] text-white/40">
            {isLastRound ? "Final Briefing" : `Round ${round} Summary`}
          </Text>
          <Text className="mt-1 font-main-bold text-2xl text-white uppercase">
            {isLastRound ? "CHAMPIONS" : "STATISTICS"}
          </Text>
          
          <View className="mt-3 flex-row items-center rounded-full bg-green-500/10 border border-green-500/20 px-4 py-1">
             <Text className="font-main-bold text-[10px] text-green-400 uppercase tracking-widest">
               Pot: {totalPot} Coins
             </Text>
          </View>
        </View>

        {/* Player List */}
        <ScrollView 
            className="max-h-[350px]" 
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
        >
          {data.map((item, index) => {
            const isWinner = index === 0;
            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: index * 100 }}
                className={`mb-4 flex-row items-center justify-between rounded-3xl border p-4 ${
                  isWinner ? "bg-indigo-600/10 border-indigo-500/30" : "bg-white/5 border-white/5"
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <View className="relative">
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/10 overflow-hidden border border-white/5">
                      <Image 
                        source={getAvatarSource(item.avatarId)} 
                        className="w-10 h-10"
                        resizeMode="contain"
                      />
                    </View>
                    <View className={`absolute -top-2 -left-2 h-6 w-6 items-center justify-center rounded-full border-2 border-[#151515] ${isWinner ? "bg-indigo-500" : "bg-white/20"}`}>
                      <Text className="font-main-bold text-[10px] text-white">{index + 1}</Text>
                    </View>
                  </View>
                  
                  <View className="ml-4 flex-1">
                    <Text className="font-main-bold text-base text-white" numberOfLines={1}>{item.name}</Text>
                    <View className="flex-row items-center">
                      <Text className="font-main-regular text-[9px] text-white/30 uppercase">
                        {(item.lastRoundTime / 1000).toFixed(1)}s
                      </Text>
                      <View className="mx-2 h-1 w-1 rounded-full bg-white/10" />
                      <Text className="font-main-regular text-[9px] text-indigo-400 uppercase">
                        {item.submissionTime || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="items-end">
                  <Text className={`font-main-bold text-lg ${isWinner ? "text-indigo-400" : "text-white"}`}>
                    {item.score}
                  </Text>
                  <Text className="font-main-regular text-[8px] text-white/20 uppercase">Points</Text>
                </View>
              </MotiView>
            );
          })}
        </ScrollView>

        {/* Footer Actions */}
        <View className="p-6">
          {isHost ? (
            <TouchableOpacity
              onPress={onNext}
              activeOpacity={0.8}
              className="w-full items-center justify-center rounded-3xl bg-indigo-600 py-4 shadow-lg shadow-indigo-600/40"
            >
              <Text className="font-main-bold text-sm uppercase tracking-widest text-white">
                {isLastRound ? "Back to Lobby" : "Next Round →"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-4">
               <Text className="font-main-bold text-xs uppercase tracking-widest text-white/40 italic">
                 Waiting for host to continue...
               </Text>
            </View>
          )}
        </View>
      </View>
    </MotiView>
  );
};
