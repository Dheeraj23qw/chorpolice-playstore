import React from "react";
import { View, ScrollView, Pressable, Image } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { hp, wp } from "@/utils/responsive";
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
  getAvatarSource: (avatarId: number) => any;
}
export const RoundLeaderboard: React.FC<RoundLeaderboardProps> = ({
  isVisible,
  round,
  data,
  onNext,
  isLastRound,
  getAvatarSource,
}) => {
  if (!isVisible || !data) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="absolute inset-0 z-[100] items-center justify-center bg-black/95 px-5"
    >
      {/* Container with max-width for responsiveness */}
      <View className="w-full max-w-[450px] overflow-hidden rounded-[48px] border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-3xl">
        {/* Header - Increased Vertical Space */}
        <View className="items-center bg-white/[0.02] px-8 py-10">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl border border-purple-500/20 bg-purple-500/10">
            <Ionicons name="trophy" size={40} color="#A855F7" />
          </View>
          <Text className="font-main-bold text-3xl uppercase tracking-[6px] text-white">
            Round {round}
          </Text>
          <Text className="font-main-regular mt-2 text-xs uppercase tracking-[4px] text-white/40">
            Official Standings
          </Text>
        </View>

        {/* Scrollable Content - Increased Vertical Padding */}
        <ScrollView className="max-h-[50vh] px-8 py-6">
          {data.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 100)}
              className={`mb-4 flex-row items-center justify-between rounded-3xl border p-5 ${
                index === 0
                  ? "border-purple-500/30 bg-purple-900/20"
                  : "border-white/5 bg-white/[0.03]"
              }`}
            >
              <View className="flex-1 flex-row items-center">
                <Text
                  className={`mr-5 font-main-bold text-xl ${index === 0 ? "text-yellow-400" : "text-white/30"}`}
                >
                  #{index + 1}
                </Text>

                {/* Image Container - Fixed Aspect Ratio */}
                <View className="mr-4 h-16 w-16 overflow-hidden rounded-2xl bg-black/20">
                  <Image
                    source={getAvatarSource(Number(item.id))}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className="font-main-bold text-lg text-white"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="font-main-regular mt-0.5 text-[10px] uppercase tracking-widest text-white/40">
                    {(item.lastRoundTime / 1000).toFixed(1)}s speed
                  </Text>
                </View>
              </View>

              <View className="items-end rounded-2xl border border-white/5 bg-black/20 px-4 py-2">
                <Text className="font-main-bold text-2xl text-purple-400">
                  {item.score}
                </Text>
                <Text className="font-main-regular text-[9px] uppercase tracking-widest text-white/20">
                  Pts
                </Text>
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Action Button - Increased Height */}
        <View className="p-8">
          <Pressable
            onPress={onNext}
            className="w-full items-center justify-center rounded-full bg-purple-600 py-5 shadow-2xl shadow-purple-600/50"
          >
            <Text className="font-main-bold text-lg uppercase tracking-[3px] text-white">
              {isLastRound ? "Final Standings" : "Start Next Round"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};
