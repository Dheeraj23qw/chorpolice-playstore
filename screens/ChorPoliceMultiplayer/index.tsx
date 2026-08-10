import React, { useEffect, memo, useState } from "react";
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
import ScoreTable from "@/modal/ShowTableModal";

import { useChorPoliceMultiplayer } from "@/hooks/useChorPoliceMultiplayer/useChorPoliceMultiplayer";

// Views
import QuizExitModal from "@/modal/QuizExitModal";
import WaitingView from "./views/WaitingView";
import DealingView from "./views/DealingView";
import PoliceTurnView from "./views/PoliceTurnView";
import ResultView from "./views/ResultView";
import RoundVideoView from "./views/RoundVideoView";
import ScoreQuizView from "./views/ScoreQuizView";
import FinalResultView from "./views/FinalResultView";
import VideoPlayerComponent from "@/components/IntroVideo";
import { RoleRevealView } from "./views/RoleRevealView";
import { OfflineRulesModal } from "@/modal/OfflineRulesModal";
import { BoostScoreModal } from "@/modal/BoostScoreModal";

const ChorPoliceMultiplayerScreen = () => {
  const insets = useSafeAreaInsets();
  const g = useChorPoliceMultiplayer();

  const [isRulesVisible, setIsRulesVisible] = useState(false);

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
        return <WaitingView g={g} />;

      case "dealing":
        return <DealingView g={g} />;

      case "police_turn":
      case "investigation_shuffle":
        return <PoliceTurnView g={g} />;

      case "private_reveal":
        return <RoleRevealView role={g.myRole} round={g.round} />;

      case "result":
        return <ResultView g={g} />;

      case "round_video":
        return <RoundVideoView g={g} />;

      case "score_quiz":
        return <ScoreQuizView g={g} />;

      case "final_result":
      case "finished":
        return <FinalResultView onExit={g.handleFinalExit} />;

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
      <View className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent" />
      <View className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <View className="flex-1">{renderView()}</View>

      {/* TOP ACTION BUTTONS */}
      <View
        className="absolute right-6 z-[1000] flex-row items-center"
        style={{ top: insets.top + 10 }}
      >
        {/* RULES BUTTON */}
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

        {/* 🏆 PERSISTENT RANKING BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={g.toggleModal}
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
