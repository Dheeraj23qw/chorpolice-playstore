import React, { useEffect, memo } from "react";
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

// Exit Modal
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

const ChorPoliceMultiplayerScreen = () => {
  const insets = useSafeAreaInsets();
  const g = useChorPoliceMultiplayer();

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
            // Move to whichever phase was queued
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
      <View className="absolute h-full w-full bg-black/70" />

      {/* Content */}
      <View className="flex-1">{renderView()}</View>

      {/* 🏆 PERSISTENT RANKING BUTTON */}
      <View
        className="absolute right-6 z-[1000]"
        style={{ top: insets.top + 10 }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={g.toggleModal}
          className="h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black"
        >
          <BlurView
            intensity={10}
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
          <Ionicons name="trophy-outline" size={20} color="#FACC15" />

          <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-black bg-indigo-500" />
        </TouchableOpacity>
      </View>

      {/* Score Table (Global) */}
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
