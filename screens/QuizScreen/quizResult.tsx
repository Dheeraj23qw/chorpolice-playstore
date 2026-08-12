import React, { useEffect, useCallback, useState, useRef } from "react";
import { View, ScrollView, Image, BackHandler } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useSelector, useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { hp, wp } from "@/utils/responsive";
import { Text } from "@/components/Text";
import useRandomMessage from "@/hooks/useRandomMessage";
import { AppDispatch, RootState } from "@/redux/store";
import { playerImages } from "@/constants/playerData";
import { resetDifficulty, setWinner } from "@/redux/reducers/quiz";

import { ResultInfo } from "./components/reseltInfo";
import { AudioEngine } from "@/audio/audioEngine";
import { useQuizReward } from "@/features/gameStats/useQuizRewards";
import { ActionButtons } from "./components/renderButtons";
import { StandingsDropdown } from "./components/StandingsDropdown";
import { QuizEngine } from "@/service/QuizEngine";
import { BotEngine } from "@/service/QuizBotEngine";
import { getSessionContext, stopSession } from "@/service/lanGameService";

export default function QuizResult() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const isMultiplayer = Object.keys(QuizEngine.state.playerScores).length > 1;

  // ✅ NEW STATE
  const [showStandings, setShowStandings] = useState(false);

  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
  } = useSelector((state: RootState) => state.difficulty);

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );

  const Motivational_Message = useRandomMessage(isWinner ? "winner" : "loser");
  const { reward: coinsAwarded } = useQuizReward();
  const coins = useSelector((state: RootState) => state.wallet.coins);

  const accuracy = Total > 0 ? Math.round((Correct / Total) * 100) : 0;

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
          withTiming(coins + Math.floor(Math.random() * 80 + 40), { duration: 220 }),
          withTiming(coins - Math.floor(Math.random() * 30 + 10), { duration: 180 }),
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
      <Animated.View style={[containerStyle]} className="items-center">
        <View className="flex-row items-center justify-center overflow-hidden rounded-2xl border border-yellow-400/40 bg-yellow-500/10 px-3 py-2 shadow-[0_0_16px_rgba(250,204,21,0.3)]">
          <Animated.View style={coinStyle} className="mr-2 h-8 w-8 items-center justify-center rounded-full border border-yellow-400/80 bg-yellow-400/20">
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

  useEffect(() => {
    AudioEngine.stop("timer");
    BotEngine.reset();
  }, []);

  const getAvatarSource = useCallback((avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.webp");
  }, []);

  const standings = isMultiplayer
    ? Object.entries(QuizEngine.state.playerScores)
        .map(([id, stats]) => ({ playerId: id, ...stats }))
        .sort(
          (a, b) =>
            b.correctCount - a.correctCount || a.totalTime - b.totalTime,
        )
    : [];

  useEffect(() => {
    if (standings.length > 0) {
      const MY_PLAYER_ID = getSessionContext().localPlayerId || "host_id";
      const winnerId = standings[0].playerId;

      // Dispatch the winner status
      dispatch(setWinner(MY_PLAYER_ID === winnerId));
    }
  }, [standings, dispatch]);

  const handleNavigation = useCallback(
    (targetRoute: string) => {
      stopSession();
      QuizEngine.reset();
      dispatch(resetDifficulty());
      requestAnimationFrame(() => {
        router.dismissAll();
        router.replace(targetRoute as any);
      });
    },
    [dispatch, router],
  );

  useEffect(() => {
    const backAction = () => {
      handleNavigation("/mode-select");
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => sub.remove();
  }, [handleNavigation]);

  return (
    <View className="flex-1 bg-black">
      {/* BACKGROUND */}
      <Image
        source={require("@/assets/images/bg/image.webp")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/80" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(5),
          paddingTop: insets.top + hp(2),
          paddingBottom: hp(5),
        }}
      >
        {/* HEADER */}
        <View className="mb-4 items-center py-4">
          <Text className="font-main-bold text-[40px] tracking-tighter text-white">
            {isWinner ? "VICTORY" : "DEFEAT"}
          </Text>
          <CoinBox />
        </View>

        {/* RESULT INFO (HIDES WHEN STANDINGS OPEN) */}
        {!showStandings && (
          <View className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04]">
            <ResultInfo
              Correct={Correct}
              Total={Total}
              Message={Motivational_Message}
              isWinner={isWinner}
              accuracy={accuracy}
              avatarSource={getAvatarSource(selectedImages[0] || 1)}
            />
          </View>
        )}

        {/* COINS ANIMATION */}
        {!showStandings && coinsAwarded !== 0 && (
          <View className="mt-4 items-center">
            <View
              className={`flex-row items-center justify-center overflow-hidden rounded-2xl border px-4 py-2 ${
                coinsAwarded >= 0
                  ? "border-emerald-400/40 bg-emerald-500/10"
                  : "border-red-400/40 bg-red-500/10"
              }`}
            >
              <View
                className={`mr-2 h-6 w-6 items-center justify-center rounded-full border ${
                  coinsAwarded >= 0
                    ? "border-emerald-400/80 bg-emerald-400/20"
                    : "border-red-400/80 bg-red-400/20"
                }`}
              >
                <Text className="text-xs">🪙</Text>
              </View>
              <View>
                <Text
                  className={`font-main-bold text-[8px] uppercase tracking-wider ${
                    coinsAwarded >= 0
                      ? "text-emerald-400/70"
                      : "text-red-400/70"
                  }`}
                >
                  {coinsAwarded >= 0 ? "Profit" : "Loss"}
                </Text>
                <Text
                  className={`font-main-bold text-sm tracking-tight ${
                    coinsAwarded >= 0
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}
                >
                  {coinsAwarded >= 0 ? "+" : ""}
                  {coinsAwarded.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* STANDINGS */}
        <StandingsDropdown
          standings={standings}
          getAvatarSource={getAvatarSource}
          isOpen={showStandings}
          onToggle={setShowStandings}
        />

        {/* ACTION BUTTONS */}
        <View className="mt-12 px-2">
          <ActionButtons
            onReportBugPress={() => handleNavigation("/report-bug")}
            onEarnPress={() => handleNavigation("/earn")}
            onHomePress={() => handleNavigation("/mode-select")}
          />
        </View>
      </ScrollView>
    </View>
  );
}
