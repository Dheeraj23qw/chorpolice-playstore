import React, { useMemo } from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeOutDown,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { rf, hp, wp } from "@/utils/responsive";

type PlayerScore = {
  scores: (number | string)[];
};

interface Props {
  playerNames: string[];
  playerScores: PlayerScore[];
  popupTable: boolean;
  gamePhase?: string;
  onClose: () => void;
}

const { height } = Dimensions.get("window");

const ScoreTable: React.FC<Props> = ({
  playerNames,
  playerScores,
  popupTable = false,
  gamePhase,
  onClose,
}) => {
  const isQuizPhase = gamePhase === "score_quiz";

  /* ---------------- Ranking Logic ---------------- */
  const rankings = useMemo(() => {
    const data = playerNames.map((name, index) => {
      const total = playerScores[index]?.scores.reduce((acc: number, val) => {
        const num = Number(val);
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
      return { name, total, index };
    });

    // Sort by total score descending
    return data.sort((a, b) => b.total - a.total);
  }, [playerNames, playerScores]);

  if (!popupTable) return null;

  const getRankColor = (rank: number) => {
    if (rank === 0) return "#FACC15"; // Gold
    if (rank === 1) return "#94A3B8"; // Silver
    if (rank === 2) return "#B45309"; // Bronze
    return "rgba(255,255,255,0.4)";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 0) return "trophy";
    if (rank === 1) return "medal";
    if (rank === 2) return "ribbon";
    return "star";
  };

  return (
    <Modal
      transparent
      visible={popupTable}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" />

      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/40">
          <BlurView intensity={25} style={StyleSheet.absoluteFill} tint="dark" />

          <Animated.View
            entering={FadeInUp.springify().damping(15)}
            exiting={FadeOutDown}
            className="overflow-hidden rounded-t-[45px] border-t border-white/15"
            style={{ height: height * 0.7 }}
          >
            <LinearGradient
              colors={["#0D0D1A", "#050508"]}
              style={StyleSheet.absoluteFill}
            />

            {/* Pull Bar */}
            <View className="items-center pt-4 pb-2">
              <View className="h-1.5 w-14 rounded-full bg-white/10" />
            </View>

            <View className="flex-1 px-6">
              {/* Header */}
              <View className="mb-8 mt-2 items-center">
                <Text
                  style={{ fontSize: rf(3.2) }}
                  className="font-main-bold tracking-tight text-white"
                >
                  Live Rankings
                </Text>
                <View className="mt-1 h-1 w-20 rounded-full bg-indigo-500/30" />
              </View>

              {/* Rankings List */}
              <View className="flex-1 gap-y-4">
                {rankings.map((player, rank) => (
                  <View
                    key={player.index}
                    className="overflow-hidden rounded-[28px] border border-white/5 bg-white/[0.03]"
                  >
                     <LinearGradient 
                        colors={["rgba(255,255,255,0.04)", "transparent"]}
                        start={{x:0, y:0}}
                        end={{x:1, y:1}}
                        style={StyleSheet.absoluteFill}
                     />
                     
                    <View className="flex-row items-center p-5">
                      {/* Rank Badge */}
                      <View 
                        className="h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: `${getRankColor(rank)}20`, borderWidth: 1, borderColor: `${getRankColor(rank)}40` }}
                      >
                        <Ionicons name={getRankIcon(rank) as any} size={22} color={getRankColor(rank)} />
                      </View>

                      {/* Name & Identity */}
                      <View className="ml-4 flex-1">
                        <Text
                          style={{ fontSize: rf(2.1) }}
                          className="font-main-bold text-white"
                        >
                          {player.name}
                        </Text>
                        <Text className="text-[9px] uppercase tracking-[2px] text-white/30">
                           Rank #{rank + 1}
                        </Text>
                      </View>

                      {/* Total Score Area - HIDDEN per request */}
                      <View className="items-end">
                        <View className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1">
                          <Text 
                            style={{ fontSize: rf(1) }}
                            className="font-main-bold uppercase tracking-widest text-indigo-300"
                          >
                             Ranked
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              <View className="pt-6 pb-10">
                 <TouchableOpacity
                   activeOpacity={0.8}
                   onPress={onClose}
                   className="overflow-hidden rounded-[28px]"
                 >
                   <LinearGradient
                     colors={["#4F46E5", "#3730A3"]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     className="shadow-xl shadow-indigo-500/30"
                   >
                     <View className="items-center justify-center py-5">
                     <Text
                       style={{ fontSize: rf(1.7) }}
                       className="font-main-bold uppercase tracking-[3px] text-white"
                     >
                       Back to Game
                     </Text>
                     </View>
                   </LinearGradient>
                 </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default React.memo(ScoreTable);
