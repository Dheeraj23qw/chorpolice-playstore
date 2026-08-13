import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    if (!isHost && !isLastQuestion) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    onNextRound();
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent" edges={["top", "bottom"]}>
      <View className="flex-1 px-5 pb-2 pt-3">
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 400,
          }}
          className="mb-3 items-center"
        >
          {/* Trophy */}
          <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/20">
            <Ionicons name="trophy" size={rf(2.4)} color="#D4AF37" />
          </View>

          {/* Eyebrow */}
          <Text
            style={{ fontSize: rf(1.1) }}
            className="font-main-bold uppercase tracking-[4px] text-[#D4AF37]"
          >
            ROUND COMPLETE
          </Text>

          {/* Title */}
          <Text
            style={{ fontSize: rf(2.6) }}
            className="mt-0.5 font-main-bold tracking-wide text-white"
          >
            Live Rankings
          </Text>

          {/* Subtitle */}
          <Text
            style={{ fontSize: rf(1.2) }}
            className="mt-0.5 text-center tracking-wider text-white/50"
          >
            Here's how everyone performed
          </Text>
        </MotiView>

        {/* ========================================================= */}
        {/* LEADERBOARD */}
        {/* ========================================================= */}

        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 400,
            delay: 100,
          }}
          /*
           * IMPORTANT:
           * flex-1 gives the leaderboard a real bounded height.
           * This allows the ScrollView below to actually scroll.
           */
          className="flex-1 overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-black/50"
        >
          {/* ======================================================= */}
          {/* TABLE HEADER */}
          {/* ======================================================= */}

          <View className="h-12 flex-row items-center border-b border-[#D4AF37]/20 bg-[#D4AF37]/5 px-5">
            {/* Rank */}
            <Text
              style={{ fontSize: rf(1.1) }}
              className="w-12 font-main-bold uppercase tracking-[2px] text-[#D4AF37]/60"
            >
              Rank
            </Text>

            {/* Player */}
            <Text
              style={{ fontSize: rf(1.1) }}
              className="flex-1 font-main-bold uppercase tracking-[2px] text-[#D4AF37]/60"
            >
              Player
            </Text>

            {/* Bonus */}
            <Text
              style={{ fontSize: rf(1.1) }}
              className="w-24 text-right font-main-bold uppercase tracking-[2px] text-[#D4AF37]/60"
            >
              Bonus
            </Text>
          </View>

          {/* ======================================================= */}
          {/* SCROLLABLE PLAYER LIST */}
          {/* ======================================================= */}

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
            contentContainerStyle={{
              paddingVertical: 6,
              paddingBottom: 12,
            }}
            bounces={true}
            nestedScrollEnabled={true}
          >
            {leaderboard.map((entry, index) => {
              const isWinner = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              // -----------------------------------------------------
              // Rank colors
              // -----------------------------------------------------

              let rankColor = "#FFFFFF";
              let rankBg = "bg-white/5";
              let rankBorder = "border-transparent";

              if (isWinner) {
                rankColor = "#D4AF37";
                rankBg = "bg-[#D4AF37]/10";
                rankBorder = "border-[#D4AF37]/40";
              } else if (isSecond) {
                rankColor = "#E2E8F0";
                rankBg = "bg-[#E2E8F0]/10";
                rankBorder = "border-[#E2E8F0]/30";
              } else if (isThird) {
                rankColor = "#CD7F32";
                rankBg = "bg-[#CD7F32]/10";
                rankBorder = "border-[#CD7F32]/30";
              }

              // -----------------------------------------------------
              // Score
              // -----------------------------------------------------

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
                  from={{
                    opacity: 0,
                    translateX: -20,
                  }}
                  animate={{
                    opacity: 1,
                    translateX: 0,
                  }}
                  transition={{
                    type: "spring",
                    damping: 18,
                    delay: 150 + index * 100,
                  }}
                  className={`mx-3 my-1.5 min-h-[76px] flex-row items-center rounded-2xl border px-4 ${rankBg} ${rankBorder}`}
                >
                  {/* ================================================= */}
                  {/* RANK */}
                  {/* ================================================= */}

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
                          style={{
                            fontSize: rf(1.5),
                            color: rankColor,
                          }}
                          className="font-main-bold"
                        >
                          {index + 1}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* ================================================= */}
                  {/* PLAYER INFO */}
                  {/* ================================================= */}

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

                    {/* Medal description */}
                    {(isWinner || isSecond || isThird) && (
                      <Text
                        style={{
                          fontSize: rf(1),
                          color: rankColor,
                        }}
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

                  {/* ================================================= */}
                  {/* BONUS */}
                  {/* ================================================= */}

                  <View className="w-24 items-end justify-center">
                    <Text
                      style={{
                        fontSize: rf(1.8),
                        color: rankColor,
                      }}
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
        </MotiView>

        {/* ========================================================= */}
        {/* BOTTOM ACTION — FIXED */}
        {/* ========================================================= */}

        <View className="mt-3 w-full shrink-0">
          {isHost && !isLastQuestion ? (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 350,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleNextRound}
                className="h-14 w-full overflow-hidden rounded-2xl border border-[#B8860B] bg-[#D4AF37]"
              >
                <LinearGradient
                  colors={["#FFE58A", "#D4AF37", "#B8860B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                  }}
                >
                  <Text
                    style={{ fontSize: rf(1.45) }}
                    className="font-main-bold uppercase tracking-[2.5px] text-black"
                  >
                    Next Question
                  </Text>

                  <View className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-black/10">
                    <Ionicons
                      name="arrow-forward"
                      size={rf(1.9)}
                      color="#000000"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>
          ) : isLastQuestion ? (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 350,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleNextRound}
                className="h-14 w-full overflow-hidden rounded-2xl border border-[#B8860B] bg-[#D4AF37]"
              >
                <LinearGradient
                  colors={["#FFE58A", "#D4AF37", "#B8860B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                  }}
                >
                  <Text
                    style={{ fontSize: rf(1.45) }}
                    className="font-main-bold uppercase tracking-[2.5px] text-black"
                  >
                    See Result
                  </Text>

                  <View className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-black/10">
                    <Ionicons
                      name="arrow-forward"
                      size={rf(1.9)}
                      color="#000000"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>
          ) : (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 300,
              }}
              className="items-center justify-center py-2"
            >
              <Text
                style={{ fontSize: rf(1.3) }}
                className="text-center font-main-bold tracking-wider text-white/70"
              >
                {!isRoundComplete
                  ? "Waiting for all players to finish..."
                  : "Waiting for host to start next question..."}
              </Text>
            </MotiView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ScoreQuizLeaderboard;
