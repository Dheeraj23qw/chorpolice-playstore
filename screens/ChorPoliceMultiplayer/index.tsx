import React, { useEffect, memo, useState, useRef } from "react";
import {
  View,
  BackHandler,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import ScoreTable from "@/modal/ShowTableModal";
import { useAppSelector } from "@/hooks/useAppRedux";
import { Text } from "@/components/Text";

import { useChorPoliceMultiplayer } from "@/hooks/useChorPoliceMultiplayer/useChorPoliceMultiplayer";

// Views
import QuizExitModal from "@/modal/QuizExitModal";
import WaitingView from "./views/WaitingView";
import DealingView from "./views/DealingView";
import PoliceTurnView from "./views/PoliceTurnView";
import ResultView from "./views/ResultView";
import RoundVideoView from "./views/RoundVideoView";

import FinalResultView from "./views/FinalResultView";
import VideoPlayerComponent from "@/components/IntroVideo";
import { RoleRevealView } from "./views/RoleRevealView";
import { OfflineRulesModal } from "@/modal/OfflineRulesModal";
import { BoostScoreModal } from "@/modal/BoostScoreModal";
import ScoreQuizView from "./views/ScoreQuizView/ScoreQuizView";

const ChorPoliceMultiplayerScreen = () => {
  const insets = useSafeAreaInsets();
  const g = useChorPoliceMultiplayer();
  const coins = useAppSelector((state) => state.wallet.coins);

  const [isRulesVisible, setIsRulesVisible] = useState(false);

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

  /* ───────── HANDLE BACK PRESS ───────── */
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      g.handleBackPress();
      return true;
    });
    return () => sub.remove();
  }, [g.handleBackPress]);

  /* ───────── PHASE ROUTER ───────── */
  const renderView = () => {
    if (g.gamePhase === "video_transition") {
      return (
        <VideoPlayerComponent
          index={1}
          onVideoEnd={() => {
            g.setGamePhase(g.nextPhase);
          }}
        />
      );
    }

    switch (g.gamePhase) {
      case "waiting":
        return <WaitingView g={g} setIsRulesVisible={setIsRulesVisible} />;

      case "dealing":
        return <DealingView g={g} setIsRulesVisible={setIsRulesVisible} />;

      case "police_turn":
      case "investigation_shuffle":
        return <PoliceTurnView g={g} setIsRulesVisible={setIsRulesVisible} />;

      case "private_reveal":
        return <RoleRevealView role={g.myRole} round={g.round} />;

      case "result":
        return <ResultView g={g} setIsRulesVisible={setIsRulesVisible} />;

      case "round_video":
        return <RoundVideoView g={g} />;

      case "score_quiz":
        return <ScoreQuizView g={g} />;

      case "final_result":
      case "finished":
        return (
          <FinalResultView
            onExit={g.handleFinalExit}
            toggleModal={g.toggleModal}
            setIsRulesVisible={setIsRulesVisible}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Background */}
      <Image
        source={require("@/assets/images/bg/image.webp")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/75" />
      {/* Ambient gradient overlays for depth */}
      <View className="absolute left-0 right-0 top-0 h-64 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent" />
      <View className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <View className="flex-1">{renderView()}</View>

      {/* Online Rules Modal */}
      <OfflineRulesModal
        visible={isRulesVisible}
        onClose={() => setIsRulesVisible(false)}
      />

      <BoostScoreModal
        visible={g.isBoostScoreModalVisible}
        onAccept={g.handleBoostScoreAccept}
        onDecline={g.handleBoostScoreDecline}
      />

      {/* Score Table Global */}
      <ScoreTable
        playerNames={g.playerNames}
        playerScores={g.playerScores}
        popupTable={g.popupTable}
        gamePhase={g.gamePhase}
        onClose={() => g.setPopupTable(false)}
      />

      {/* Exit Modal */}
      <QuizExitModal
        visible={g.isExitModalVisible}
        onCancel={g.handleCancelExit}
        onConfirm={g.handleConfirmExit}
        isHost={g.isHost}
        isMultiplayer={true}
        currentRound={g.round}
        totalRounds={g.totalRounds}
      />
    </View>
  );
};

export default memo(ChorPoliceMultiplayerScreen);
