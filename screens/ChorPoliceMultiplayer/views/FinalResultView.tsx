import React, { useMemo, memo, useEffect, useRef } from "react";
import { View, ScrollView, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { RootState } from "@/redux/store";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { selectLocalPlayerId } from "@/redux/selectors/sessionSelectors";
import { ActionButtons } from "@/screens/QuizScreen/components/renderButtons";
import { cleanupAfterMatchCompleted } from "@/service/lanGameService";

const MemoizedLeaderboard = memo(Leaderboard);
const MemoizedWinnerSection = memo(WinnerSection);

const FinalResultView = ({ onExit }: any) => {
  // 🔥 BACKUP: Ensure sockets are cleaned up when result screen mounts/unmounts
  useEffect(() => {
    // Mount: Backup cleanup in case economyHandlers path was missed
    cleanupAfterMatchCompleted({
      reason: "final_result_mount_backup",
      preserveResult: true,
    });

    return () => {
      // Unmount: Final safety net (e.g. hardware back, swipe, forced navigation)
      cleanupAfterMatchCompleted({
        reason: "final_result_unmount_backup",
        preserveResult: true,
      });
    };
  }, []);
  const playerScoresRedux = useSelector(
    (state: RootState) => state.player.playerScores,
  );
  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );
  const playerNamesList = useSelector(
    (state: RootState) => state.player.playerNames,
  );

  const sortedScores = useMemo(() => {
    if (!playerScoresRedux?.length) return [];
    return [...playerScoresRedux].sort(
      (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0),
    );
  }, [playerScoresRedux]);

  const winner = sortedScores[0];

  const winnerMeta = playerNamesList.find((player) =>
    winner?.playerId
      ? player.id === winner.playerId
      : player.name === winner?.playerName,
  );

  const winnerIdx = playerNamesList.findIndex((player) =>
    winner?.playerId
      ? player.id === winner.playerId
      : player.name === winner?.playerName,
  );

  const winnerAvatarId =
    winnerMeta?.avatarId ?? (winnerIdx >= 0 ? selectedImages[winnerIdx] : 1);

  const winnerImage = playerImages[winnerAvatarId]?.src ?? playerImages[1]?.src;

  const localPlayerId = useSelector(selectLocalPlayerId);
  const isLocalWinner = winner?.playerId === localPlayerId;

  const stakeAmount = useSelector(
    (state: RootState) => state.session?.economy?.stakeAmount ?? 0,
  );

  const totalPot =
    ChorPoliceEngine.state.totalPot || ChorPoliceEngine.state.stake * 4;

  const winners = useMemo(() => {
    if (!sortedScores.length) return [];
    const maxScore = sortedScores[0].totalScore ?? 0;
    return sortedScores.filter((p) => (p.totalScore ?? 0) === maxScore);
  }, [sortedScores]);

  const splitPot =
    winners.length > 0 ? Math.floor(totalPot / winners.length) : 0;

  const coinChanges = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of sortedScores) {
      const key = p.playerId ?? p.playerName;
      if (!key) continue;
      if ((p.totalScore ?? 0) === (sortedScores[0]?.totalScore ?? 0)) {
        map[key] = splitPot - stakeAmount;
      } else {
        map[key] = -stakeAmount;
      }
    }
    return map;
  }, [sortedScores, splitPot, stakeAmount]);

  const localKey =
    localPlayerId ?? playerNamesList.find((p) => p.id === localPlayerId)?.name;
  const localCoinChange = localKey ? coinChanges[localKey] : 0;

  const coins = useSelector((state: RootState) => state.wallet.coins);

  const CoinBox = () => {
    const pulse = useSharedValue(1);
    const coinBob = useSharedValue(0);
    const pop = useSharedValue(1);
    const displayCoins = useSharedValue(coins);
    const prevCoins = useRef(coins);

    useEffect(() => {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
      coinBob.value = withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }, []);

    useEffect(() => {
      pop.value = withSequence(
        withSpring(1.25, { damping: 9, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      );
    }, [coins]);

    useEffect(() => {
      if (prevCoins.current !== coins) {
        displayCoins.value = withSequence(
          withTiming(coins + Math.floor(Math.random() * 80 + 40), {
            duration: 220,
          }),
          withTiming(coins - Math.floor(Math.random() * 30 + 10), {
            duration: 180,
          }),
          withSpring(coins, { damping: 6, stiffness: 180 }),
        );
        prevCoins.current = coins;
      }
    }, [coins]);

    const containerStyle = useAnimatedStyle(() => ({
      opacity: 0.7 + 0.3 * pulse.value,
      transform: [
        { translateY: -2 * coinBob.value },
        { scale: 1 + 0.02 * coinBob.value },
      ],
    }));

    const coinStyle = useAnimatedStyle(() => ({
      transform: [{ scale: 0.9 + 0.1 * coinBob.value }],
    }));

    const popStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pop.value }],
    }));

    const numberStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pop.value }],
    }));

    return (
      <Animated.View style={[containerStyle]} className="mt-2 items-center">
        <View className="flex-row items-center justify-center overflow-hidden rounded-2xl border border-yellow-400/40 bg-yellow-500/10 px-3 py-2 shadow-[0_0_16px_rgba(250,204,21,0.3)]">
          <Animated.View
            style={coinStyle}
            className="mr-2 h-8 w-8 items-center justify-center rounded-full border border-yellow-400/80 bg-yellow-400/20"
          >
            <Text className="text-base">🪙</Text>
          </Animated.View>
          <View>
            <Text className="font-main-bold text-[8px] uppercase tracking-wider text-yellow-400/70">
              Coins
            </Text>
            <Animated.View style={numberStyle}>
              <Text className="font-main-bold text-base tracking-tight text-yellow-300">
                {displayCoins.value.toLocaleString()}
              </Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      {/* 🔥 Background Image */}
      <Image
        source={require("@/assets/images/bg/image.webp")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/70" />

      {/* Content */}
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Winner */}
        {winner && (
          <View className="items-center pt-4">
            <MemoizedWinnerSection
              winnerName={winner.playerName}
              winnerImage={winnerImage}
              winner={winner}
            />
          </View>
        )}

        {/* List */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pt-2">
            <MemoizedLeaderboard
              sortedScores={sortedScores}
              playerNames={playerNamesList}
              selectedImages={selectedImages}
              coinChanges={coinChanges}
            />
          </View>

          {/* Buttons */}
          <View className="mt-2 px-4">
            <ActionButtons
              onReportBugPress={() => onExit("report-bug")}
              onEarnPress={() => onExit("earn")}
              onHomePress={() => onExit("home")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default memo(FinalResultView);
