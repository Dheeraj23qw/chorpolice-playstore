import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface ScoreQuizLeaderboardProps {
  onNextRound: () => void;
  isHost?: boolean;
  isRoundComplete?: boolean;
  isLastQuestion?: boolean;
}

const ScoreQuizLeaderboard: React.FC<ScoreQuizLeaderboardProps> = ({
  onNextRound,
  isHost = false,
  isRoundComplete = false,
  isLastQuestion = false,
}) => {
  const leaderboard = ChorPoliceEngine.getLevel2Leaderboard();

  const handleNextRound = () => {
    if (!isHost) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onNextRound();
  };

  return (
    // Kept transparent so your app's main background remains fully visible
    <SafeAreaView className="flex-1 bg-transparent" edges={["top", "bottom"]}>
      <View className="flex-1 px-6 pt-10">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          className="flex-1"
        >
          {/* HEADER */}
          <View className="mb-10 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/20">
              <Ionicons name="trophy" size={rf(3)} color="#D4AF37" />
            </View>

            <Text
              style={{ fontSize: rf(1.2) }}
              className="font-main-bold uppercase tracking-[4px] text-[#D4AF37]"
            >
              ROUND COMPLETE
            </Text>

            <Text
              style={{ fontSize: rf(3.2) }}
              className="mt-2 font-main-bold tracking-wide text-white"
            >
              Live Rankings
            </Text>

            <Text
              style={{ fontSize: rf(1.4) }}
              className="mt-2 text-center tracking-wider text-white/50"
            >
              Here’s how everyone performed
            </Text>
          </View>

          {/* WELL-SPACED LEADERBOARD TABLE */}
          <View className="flex-1 overflow-hidden rounded-[32px] border border-[#D4AF37]/20 bg-black/50 pb-2">
            {/* Table Heading */}
            <View className="h-14 flex-row items-center border-b border-[#D4AF37]/20 bg-[#D4AF37]/5 px-5">
              <Text
                style={{ fontSize: rf(1.1) }}
                className="w-12 font-main-bold uppercase tracking-[2px] text-[#D4AF37]/60"
              >
                Rank
              </Text>

              <Text
                style={{ fontSize: rf(1.1) }}
                className="flex-1 font-main-bold uppercase tracking-[2px] text-[#D4AF37]/60"
              >
                Player
              </Text>

              <Text
                style={{ fontSize: rf(1.1) }}
                className="w-24 text-right font-main-bold uppercase tracking-[2px] text-[#D4AF37]/60"
              >
                Bonus
              </Text>
            </View>

            {/* Scrollable Rows (in case of many players) */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {leaderboard.map((entry, index) => {
                const isWinner = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                // Assign metallic colors based on rank
                let rankColor = "#FFFFFF"; // Default
                let rankBg = "bg-white/5";
                let rankBorder = "border-transparent";

                if (isWinner) {
                  rankColor = "#D4AF37"; // Gold
                  rankBg = "bg-[#D4AF37]/10";
                  rankBorder = "border-[#D4AF37]/40";
                } else if (isSecond) {
                  rankColor = "#E2E8F0"; // Silver
                  rankBg = "bg-[#E2E8F0]/10";
                  rankBorder = "border-[#E2E8F0]/30";
                } else if (isThird) {
                  rankColor = "#CD7F32"; // Bronze
                  rankBg = "bg-[#CD7F32]/10";
                  rankBorder = "border-[#CD7F32]/30";
                }

                const scoreEntry = entry.id
                  ? ChorPoliceEngine.state.scores[entry.id]
                  : null;

                const level2Bonus = scoreEntry?.level2Bonus ?? 0;
                const formattedBonus =
                  level2Bonus > 0
                    ? `+${level2Bonus.toLocaleString()}`
                    : level2Bonus.toLocaleString();

                return (
                  <MotiView
                    key={entry.id || index}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{
                      type: "spring",
                      damping: 18,
                      delay: 150 + index * 100,
                    }}
                    className={`mx-3 my-1.5 min-h-[76px] flex-row items-center rounded-2xl border px-4 ${rankBg} ${rankBorder}`}
                  >
                    {/* Rank Badge */}
                    <View className="w-12">
                      <View className="h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-black/40">
                        {isWinner ? (
                          <Ionicons
                            name="trophy"
                            size={rf(1.8)}
                            color={rankColor}
                          />
                        ) : (
                          <Text
                            style={{ fontSize: rf(1.5), color: rankColor }}
                            className="font-main-bold"
                          >
                            {index + 1}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Player Info */}
                    <View className="flex-1 pr-3">
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: rf(1.8),
                          color: isWinner ? rankColor : "#F3F4F6",
                        }}
                        className="font-main-bold tracking-wide"
                      >
                        {entry.name}
                      </Text>

                      {(isWinner || isSecond || isThird) && (
                        <Text
                          style={{ fontSize: rf(1), color: rankColor }}
                          className="mt-1 font-main-bold uppercase tracking-widest opacity-80"
                        >
                          {isWinner
                            ? "Champion"
                            : isSecond
                              ? "Runner Up"
                              : "Third Place"}
                        </Text>
                      )}
                    </View>

                    {/* Bonus Score */}
                    <View className="w-24 items-end justify-center">
                      <Text
                        style={{ fontSize: rf(1.8), color: rankColor }}
                        className="font-main-bold"
                      >
                        {formattedBonus}
                      </Text>
                      <Text
                        style={{ fontSize: rf(1) }}
                        className="mt-1 uppercase tracking-widest text-white/40"
                      >
                        Points
                      </Text>
                    </View>
                  </MotiView>
                );
              })}
            </ScrollView>
          </View>
        </MotiView>

        {/* BOTTOM ACTION AREA */}
        {isHost && isRoundComplete ? (
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 600 }}
            className="mb-4 mt-6"
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNextRound}
              className="h-16 w-full flex-row items-center justify-center rounded-2xl bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/40"
            >
              <Text
                style={{ fontSize: rf(1.5) }}
                className="mr-2 font-main-bold uppercase tracking-[3px] text-black"
              >
                {isLastQuestion ? "Final Result" : "Next Round"}
              </Text>
              <Ionicons name="arrow-forward" size={rf(2.2)} color="#000000" />
            </TouchableOpacity>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 mt-6 items-center justify-center py-4"
          >
            <Text
              style={{ fontSize: rf(1.4) }}
              className="font-main-bold text-center tracking-wider text-white/70"
            >
              {!isRoundComplete
                ? "Waiting for all players to finish..."
                : "Waiting for host to start next round..."}
            </Text>
          </MotiView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ScoreQuizLeaderboard;
