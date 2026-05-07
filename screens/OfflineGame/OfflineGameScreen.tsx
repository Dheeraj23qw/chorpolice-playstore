import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Text } from "@/components/Text";
import { AudioEngine } from "@/audio/audioEngine";
import PlayButton from "@/components/RajamantriGameScreen/playButton";
import { useOfflineChorPolice } from "@/hooks/useOfflineChorPolice";
import OverlayPopUp from "@/modal/overlaypop";
import { OfflineRulesModal } from "@/modal/OfflineRulesModal";
import CinematicReveal from "../ChorPoliceMultiplayer/components/CinematicReveal";
import { hp, rf, wp } from "@/utils/responsive";
import { OfflineGameBoard } from "./components/OfflineGameBoard";
import { OfflineGameHeader } from "./components/OfflineGameHeader";
import { OfflineInvestigationBanner } from "./components/OfflineInvestigationBanner";
import { OfflineLeaderboardModal } from "./components/OfflineLeaderboardModal";
import { OfflineResultOverlay } from "./components/OfflineResultOverlay";

const COUNTDOWN_STEP_MS = 1400;
const PUBLIC_REVEAL_SETTLE_MS = 1400;
const INVESTIGATION_ENTRY_MS = 1200;
const DEALING_SPIN_MS = 2500;

const OfflineGameScreen = () => {
  const router = useRouter();
  const g = useOfflineChorPolice();

  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [showScores, setShowScores] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showResultCinematic, setShowResultCinematic] = useState(false);
  const [showOverlayPopup, setShowOverlayPopup] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const animStyle = useMemo(() => (g.currentRound - 1) % 4, [g.currentRound]);
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    if (g.phase === "dealing") {
      setFlippedIndices(new Set());
      setShowFinalSummary(false);
      setShowResultCinematic(false);
      setShowOverlayPopup(false);
      setIsSpinning(true);
      setCountdown(null);

      AudioEngine.play("spin", "gameplay");

      timer = setTimeout(() => {
        setIsSpinning(false);
        g.setPhase("public_reveal");
      }, DEALING_SPIN_MS);
    } else if (g.phase === "public_reveal") {
      setFlippedIndices((prev) => {
        const next = new Set(prev);
        if (g.kingIndex !== null) next.add(g.kingIndex);
        if (g.policeIndex !== null) next.add(g.policeIndex);
        return next;
      });
      AudioEngine.play("level", "gameplay");

      const countdownStart = setTimeout(() => {
        setCountdown(3);
        AudioEngine.play("select", "ui");

        const countdownTwo = setTimeout(() => {
          setCountdown(2);
          AudioEngine.play("select", "ui");

          const countdownOne = setTimeout(() => {
            setCountdown(1);
            AudioEngine.play("select", "ui");

            const shuffleEntry = setTimeout(() => {
              setCountdown(null);
              g.setPhase("investigation_shuffle");
            }, COUNTDOWN_STEP_MS);

            timerRefs.current.push(shuffleEntry);
          }, COUNTDOWN_STEP_MS);

          timerRefs.current.push(countdownOne);
        }, COUNTDOWN_STEP_MS);

        timerRefs.current.push(countdownTwo);
      }, PUBLIC_REVEAL_SETTLE_MS);

      timerRefs.current.push(countdownStart);
    } else if (g.phase === "investigation_shuffle") {
      const policeTurnTimer = setTimeout(() => {
        g.setPhase("police_turn");
      }, INVESTIGATION_ENTRY_MS);

      timerRefs.current.push(policeTurnTimer);
    } else if (g.phase === "result") {
      setShowResultCinematic(true);
      setFlippedIndices(new Set([0, 1, 2, 3]));
      AudioEngine.play(
        g.result?.winner === "police" ? "win" : "lose",
        "gameplay",
      );
    } else if (g.phase === "idle") {
      setFlippedIndices(new Set());
      setShowFinalSummary(false);
      setShowResultCinematic(false);
      setShowOverlayPopup(false);
      setCountdown(null);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [g.phase, g.kingIndex, g.policeIndex, g.result?.winner, g.setPhase]);

  const handleInvestigationClick = useCallback(
    (targetId: string, playerIndex: number | null) => {
      if (g.phase === "police_turn") {
        g.handlePoliceGuess(targetId, playerIndex);
      }
    },
    [g.handlePoliceGuess, g.phase],
  );

  const handleNextRound = useCallback(() => {
    AudioEngine.play("select", "ui");
    if (g.currentRound < g.totalRounds) {
      g.nextRound();
    } else {
      router.dismissAll();
      router.replace("/");
    }
  }, [g.currentRound, g.nextRound, g.totalRounds, router]);

  const handlePlayAgain = useCallback(() => {
    AudioEngine.play("select", "ui");
    g.resetGame();
  }, [g.resetGame]);

  const handleBack = useCallback(() => {
    AudioEngine.play("select", "ui");
    router.back();
  }, [router]);

  const toggleLeaderboard = useCallback((visible: boolean) => {
    AudioEngine.play("select", "ui");
    setShowScores(visible);
  }, []);

  const toggleRules = useCallback((visible: boolean) => {
    AudioEngine.play("select", "ui");
    setShowRules(visible);
  }, []);

  const onOverlayStateChange = useCallback((visible: boolean) => {
    if (!visible) {
      setShowOverlayPopup(false);
      setShowFinalSummary(true);
    }
  }, []);

  const onCinematicComplete = useCallback(() => {
    setShowResultCinematic(false);
    setShowOverlayPopup(true);
  }, []);

  const handleStartRound = useCallback(() => {
    AudioEngine.play("select", "ui");
    g.handlePlay();
  }, [g.handlePlay]);

  const buttonText = useMemo(() => {
    if (g.phase === "idle") return "Press me to play!";
    if (g.phase === "dealing") return "Dealing roles...";
    if (g.phase === "public_reveal") return "King & Police Revealed!";
    if (g.phase === "investigation_shuffle") return "Shuffling targets...";
    if (g.phase === "police_turn") {
      const policeName = g.players[g.policeIndex ?? 0]?.name || "Police";
      return `${policeName}, find the Thief!`;
    }
    return "Round Complete!";
  }, [g.phase, g.players, g.policeIndex]);

  const hasRoundStarted = g.phase !== "idle";
  const policeName = g.players[g.policeIndex ?? 0]?.name || "Police";
  const investigationMessage =
    g.phase === "police_turn" || g.phase === "investigation_shuffle"
      ? `${policeName}, catch the Thief and stay away from Joker`
      : null;

  return (
    <View className="flex-1 bg-black">
      <Image
        source={require("@/assets/images/bg/image.webp")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/80" />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <OfflineGameHeader
          onBack={handleBack}
          onShowScores={() => toggleLeaderboard(true)}
          onShowRules={() => toggleRules(true)}
        />

        {!showResultCinematic && !showOverlayPopup && !showFinalSummary && (
          <View className="flex-1 px-6">
            <View className="mb-8 mt-4 items-center">
              <View className="relative overflow-hidden rounded-full border border-white/20 bg-white/10 px-6 py-2">
                <View className="absolute inset-x-2 top-0 h-[1px] rounded-full bg-white/30" />
                <Text
                  style={{ fontSize: rf(1.4), letterSpacing: wp(1) }}
                  className="font-main-bold uppercase text-indigo-300"
                >
                  Round {g.currentRound}
                </Text>
              </View>
            </View>

            {!hasRoundStarted && (
              <View className="mb-9">
                <PlayButton
                  disabled={false}
                  onPress={handleStartRound}
                  buttonText={buttonText}
                />
              </View>
            )}

            {investigationMessage && (
              <OfflineInvestigationBanner message={investigationMessage} />
            )}

            <View
              className="flex-1"
              style={{
                justifyContent: hasRoundStarted ? "flex-start" : "center",
                paddingTop: hasRoundStarted ? hp(2) : 0,
              }}
            >
              <OfflineGameBoard
                players={g.players}
                roles={g.roles}
                round={g.currentRound}
                phase={g.phase}
                flippedIndices={flippedIndices}
                isSpinning={isSpinning}
                animStyle={animStyle}
                kingIndex={g.kingIndex}
                policeIndex={g.policeIndex}
                investigationTargets={g.investigationTargets}
                clickedTargetId={g.clickedTargetId}
                countdown={countdown}
                onInvestigationClick={handleInvestigationClick}
              />
            </View>
          </View>
        )}
      </SafeAreaView>

      {showResultCinematic && g.result && (
        <CinematicReveal
          index={g.clickedIndex !== null ? g.clickedIndex : -1}
          role={
            g.clickedTargetId
              ? g.investigationTargets.find((target) => target.id === g.clickedTargetId)?.role ||
                "Joker"
              : "Joker"
          }
          isCorrect={g.result.winner === "police"}
          policeName={g.players[g.policeIndex ?? 0]?.name}
          advisorName={
            g.clickedIndex !== null && g.roles[g.clickedIndex] === "Advisor"
              ? g.players[g.clickedIndex].name
              : undefined
          }
          onComplete={onCinematicComplete}
        />
      )}

      {showOverlayPopup && g.result && (
        <OverlayPopUp
          index={g.result.winner === "police" ? 4 : 3}
          policeIndex={g.policeIndex ?? 0}
          thiefIndex={g.thiefIndex ?? 0}
          kingIndex={g.kingIndex ?? 0}
          advisorIndex={g.advisorIndex ?? 0}
          onStateChange={onOverlayStateChange}
        />
      )}

      <OfflineResultOverlay
        visible={showFinalSummary}
        result={g.result}
        players={g.players}
        roles={g.roles}
        currentRound={g.currentRound}
        totalRounds={g.totalRounds}
        totalScores={g.scores}
        onNextRound={handleNextRound}
        onPlayAgain={handlePlayAgain}
      />

      <OfflineRulesModal
        visible={showRules}
        onClose={() => toggleRules(false)}
      />

      <OfflineLeaderboardModal
        visible={showScores}
        players={g.players}
        scores={g.scores}
        onClose={() => toggleLeaderboard(false)}
      />
    </View>
  );
};

export default OfflineGameScreen;
