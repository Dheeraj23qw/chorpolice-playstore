import React, { useEffect, memo } from "react";
import { View, BackHandler, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChorPoliceMultiplayer } from "@/hooks/useChorPoliceMultiplayer";

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

const ChorPoliceMultiplayerScreen = () => {
  const insets = useSafeAreaInsets();
  const g = useChorPoliceMultiplayer();

  /* ───────── HANDLE BACK PRESS ───────── */
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      g.handleQuitInMiddle();
      return true;
    });
    return () => sub.remove();
  }, [g.handleQuitInMiddle]);

  /* ───────── PHASE ROUTER ───────── */
  const renderView = () => {
    if (g.gamePhase === "video_transition") {
      return (
        <VideoPlayerComponent
          videoIndex={1}
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
        return <PoliceTurnView g={g} />;

      case "result":
        return <ResultView g={g} />;

      case "round_video":
        return <RoundVideoView g={g} />;

      case "score_quiz":
        return <ScoreQuizView g={g} />;

      case "final_result":
      case "finished":
        return (
          <FinalResultView
            onExit={g.handleFinalExit}
            onPlayAgain={g.handlePlayAgain}
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
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/70" />

      {/* Content */}
      <View className="flex-1">{renderView()}</View>

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
