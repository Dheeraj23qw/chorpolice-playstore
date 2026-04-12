import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { rf, hp, wp } from "@/utils/responsive";

interface LeaderboardItem {
  id: string;
  name: string;
  score: number;
  lastRoundTime: number;
  totalTime: number;
}

interface RoundLeaderboardProps {
  isVisible: boolean;
  round: number;
  data: LeaderboardItem[];
  onNext: () => void;
  isLastRound?: boolean;
}

export const RoundLeaderboard: React.FC<RoundLeaderboardProps> = ({
  isVisible,
  round,
  data,
  onNext,
  isLastRound,
}) => {
  if (!isVisible || !data) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      className="absolute inset-0 z-[100] items-center justify-center bg-black/90 px-6"
    >
      <View className="w-full max-w-md overflow-hidden rounded-[40px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <View className="bg-purple-600/20 px-6 py-6 items-center">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 mb-3">
             <Ionicons name="trophy" size={24} color="#A855F7" />
          </View>
          <Text className="font-main-bold text-2xl uppercase tracking-[4px] text-white">
            Round {round} Results
          </Text>
          <Text className="font-main-regular text-[10px] text-white/40 uppercase tracking-widest mt-1">
            Official Standings
          </Text>
        </View>

        <ScrollView className="max-h-[400px] px-6 py-4">
          {data.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 100)}
              className={`mb-3 flex-row items-center justify-between rounded-2xl border p-4 ${
                index === 0 ? "bg-purple-600/10 border-purple-500/30" : "bg-white/5 border-white/5"
              }`}
            >
              <View className="flex-row items-center">
                <Text className={`font-main-bold text-lg mr-4 ${index === 0 ? "text-yellow-400" : "text-white/20"}`}>
                  #{index + 1}
                </Text>
                <View>
                  <Text className="font-main-bold text-base text-white">{item.name}</Text>
                  <View className="flex-row items-center">
                    <Text className="font-main-regular text-[9px] text-white/30 uppercase tracking-tighter">
                      {(item.lastRoundTime / 1000).toFixed(1)}s speed
                    </Text>
                    <View className="mx-2 h-1 w-1 rounded-full bg-white/10" />
                    <Text className="font-main-regular text-[9px] text-purple-400 uppercase tracking-tighter">
                      Sub at {item.submissionTime || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="items-end">
                <Text className="font-main-bold text-lg text-purple-400">{item.score}</Text>
                <Text className="font-main-regular text-[8px] text-white/20 uppercase">Pts</Text>
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        <View className="p-6">
          <Pressable
            onPress={onNext}
            className="w-full items-center justify-center rounded-3xl bg-purple-600 py-4 shadow-lg shadow-purple-600/40"
          >
            <Text className="font-main-bold text-base uppercase tracking-widest text-white">
              {isLastRound ? "Final Standings" : "Start Next Round"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};
