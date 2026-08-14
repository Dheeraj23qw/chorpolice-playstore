import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useAppSelector } from "@/hooks/useAppRedux";

import { OfflineCountdownBadge } from "@/screens/OfflineGame/components/OfflineCountdownBadge";
import PlayButton from "@/components/RajamantriGameScreen/playButton";
import { Text } from "@/components/Text";

import { useDealingStage } from "./hooks/useDealingStage";
import { useMysteryShuffle } from "./hooks/useMysteryShuffle";
import { GamePlaySectionProps } from "./types";
import { CardGrid } from "./components/CardGrid";
import { InvestigationBoard } from "./components/InvestigationBoard";
import { RoundBadge } from "./components/RoundBadge";

export const GamePlaySection: React.FC<GamePlaySectionProps> = ({
  isPlayButtonDisabled,
  handlePlay,
  roles,
  playerNames,
  flippedStates,
  clickedCards,
  handleCardClick,
  handleCardClickWithBounce,
  toggleModal,
  setIsRulesVisible,
  round,
  message,
  countdown,
  getCardStyle,
  isHighlight,
  invisibleIndices = [],
  localPlayerIndex,
  gamePhase = "waiting",
  investigationTargets = [],
  popupIndex,
  dealAnimationPreset = "classicSpin",
  mysteryRevealStep = 0,
}) => {
  const dealingStage = useDealingStage(gamePhase, round);

  const mysteryShuffleStep = useMysteryShuffle(
    gamePhase,
    round,
    investigationTargets.length,
  );

  const isInvestigation =
    (gamePhase === "police_turn" ||
      gamePhase === "investigation_shuffle" ||
      gamePhase === "result" ||
      popupIndex === 4 ||
      popupIndex === 3) &&
    investigationTargets.length > 0;

  const buttonText = isPlayButtonDisabled
    ? message || `Round ${round}`
    : "Start Game";

  // ── Keep the board MOUNTED during cinematic/result popups ──────────────
  // Previously this was `if (isCinematicOrResult) return null;` which
  // destroyed the MotiView tree mid-animation, killing smash-out / rise /
  // flip. Now we hide it visually so the animations keep running.
  const isCinematicOrResult =
    popupIndex === 5 || popupIndex === 4 || popupIndex === 3;

  const shouldShowCountdown = typeof countdown === "number" && countdown > 0;
  const coins = useAppSelector((state: any) => state.wallet.coins);

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

    const numberStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pop.value }],
    }));

    return (
      <Animated.View style={[containerStyle]}>
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

  return (
    <SafeAreaView
      className="flex-1 bg-transparent"
      style={isCinematicOrResult ? styles.hiddenButMounted : undefined}
      pointerEvents={isCinematicOrResult ? "none" : "auto"}
    >
      <View className="relative flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 110,
          }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          {!isPlayButtonDisabled && (
            <View
              className="mb-4 flex-row items-center justify-between"
            >
              <CoinBox />
              <View className="flex-row items-center">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsRulesVisible(true)}
                  className="mr-3 h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black"
                >
                  <BlurView
                    intensity={10}
                    style={StyleSheet.absoluteFill}
                    tint="dark"
                  />
                  <View className="h-full w-full items-center justify-center">
                    <Ionicons name="book-outline" size={20} color="#C7D2FE" />
                  </View>
                  <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-black bg-cyan-400" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={toggleModal}
                  className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black"
                >
                  <BlurView
                    intensity={10}
                    style={StyleSheet.absoluteFill}
                    tint="dark"
                  />
                  <View className="h-full w-full items-center justify-center">
                    <Ionicons name="trophy-outline" size={20} color="#FACC15" />
                  </View>
                  <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-black bg-indigo-500" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!isPlayButtonDisabled && <RoundBadge round={round} />}

          <View className="mb-9">
            {!isInvestigation && (
              <PlayButton
                disabled={isPlayButtonDisabled}
                onPress={handlePlay}
                buttonText={buttonText}
              />
            )}
          </View>

          <View className="flex-col gap-y-8">
            {!isInvestigation ? (
              <CardGrid
                round={round}
                roles={roles}
                playerNames={playerNames}
                flippedStates={flippedStates}
                clickedCards={clickedCards}
                isHighlight={isHighlight}
                invisibleIndices={invisibleIndices}
                gamePhase={gamePhase}
                dealingStage={dealingStage}
                dealAnimationPreset={dealAnimationPreset}
                localPlayerIndex={localPlayerIndex}
                handleCardClick={handleCardClick}
                handleCardClickWithBounce={handleCardClickWithBounce}
                getCardStyle={getCardStyle}
              />
            ) : (
              <InvestigationBoard
                round={round}
                gamePhase={gamePhase}
                investigationTargets={investigationTargets}
                flippedStates={flippedStates}
                clickedCards={clickedCards}
                mysteryShuffleStep={mysteryShuffleStep}
                mysteryRevealStep={mysteryRevealStep}
                handleCardClick={handleCardClick}
                localPlayerIndex={localPlayerIndex}
              />
            )}
          </View>
        </ScrollView>

        {shouldShowCountdown && (
          <View pointerEvents="none" style={styles.countdownOverlay}>
            <OfflineCountdownBadge value={countdown} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  countdownOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
  },
  hiddenButMounted: {
    opacity: 0,
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
  },
});
