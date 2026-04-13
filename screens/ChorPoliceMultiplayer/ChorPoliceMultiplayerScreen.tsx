import React, { useEffect, memo, useMemo, useState } from "react";
import { View, BackHandler, Image, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChorPoliceMultiplayer } from "@/hooks/useChorPoliceMultiplayer";

// Reuse existing offline components
import OverlayPopUp from "@/modal/overlaypop";
import ScoreTable from "@/modal/ShowTableModal";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { GamePlaySection } from "@/screens/RajaMantriGameScreen/GameplaySection";
import VideoPlayerComponent from "@/components/IntroVideo";
import QuizExitModal from "@/modal/QuizExitModal";

// Score quiz components (reused from offline)
import PlayerInfo from "@/components/chorPoliceQuiz/playerInfo";
import QuizOptions from "@/components/chorPoliceQuiz/option";

// Result screen components
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { ActionButtons } from "@/components/leaderBoardScreen/ActionButtons";
import { VictoryCelebration } from "@/components/VictoryCelebration";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { rf, hp, wp } from "@/utils/responsive";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Role-specific view for Thief/Advisor (big role image after King/Police reveal)
import { RoleRevealView } from "./views/RoleRevealView";

/**
 * --- FINAL RESULT VIEW (extracted as real component for hooks) ---
 * Matches offline chorPoliceResult.tsx UI exactly.
 */
const FinalResultView: React.FC<{
  onExit: () => void;
  onPlayAgain: () => void;
}> = ({ onExit, onPlayAgain }) => {
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
  const winnerIdx = playerNamesList.findIndex(
    (p) => p.name === winner?.playerName,
  );
  const winnerImage =
    winnerIdx >= 0
      ? playerImages[selectedImages[winnerIdx]]?.src || playerImages[1]?.src
      : playerImages[1]?.src;

  const stake = ChorPoliceEngine.state.stake;
  const totalPot = ChorPoliceEngine.state.totalPot || stake * 4;

  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowCelebration(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Share handler
  const handleShare = useCallback(async () => {
    try {
      const { captureScreen } = require("react-native-view-shot");
      const Sharing = require("expo-sharing");
      const uri = await captureScreen({ format: "png", quality: 0.9 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return;
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share Game Results",
      });
    } catch (error) {
      console.error("[Share Error]", error);
    }
  }, []);

  return (
    <View className="flex-1">
      {/* 🏆 CELEBRATION LAYER */}
      {showCelebration && (
        <View className="absolute inset-0 z-[100]" pointerEvents="none">
          <VictoryCelebration
            type="GOLD"
            intensity="MEDIUM"
            duration={4500}
            onComplete={() => setShowCelebration(false)}
          />
        </View>
      )}

      {/* Header Title */}
      <View className="px-6 py-4">
        <Text
          style={{ fontSize: rf(1.2) }}
          className="font-main-bold uppercase tracking-[5px] text-white/40"
        >
          Final Briefing
        </Text>
        <Text
          style={{ fontSize: rf(3.5) }}
          className="mt-1 font-main-bold text-white"
        >
          RESULTS
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(5) }}
      >
        {/* 1. Winner Spotlight */}
        {winner && (
          <View className="mb-6 px-6">
            <View className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.05] py-6 shadow-2xl backdrop-blur-3xl">
              <WinnerSection
                winnerName={winner.playerName || ""}
                winnerImage={winnerImage}
                winner={winner}
              />
              {/* 💰 Bid Won Message */}
              {totalPot > 0 && (
                <View className="items-center mt-2 pb-2">
                  <View className="bg-emerald-500/15 border border-emerald-500/30 px-5 py-2 rounded-full">
                    <Text
                      style={{ fontSize: rf(1.3) }}
                      className="font-main-bold text-emerald-400 tracking-wider"
                    >
                      🎉 Won the pot of {totalPot} coins!
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 2. Leaderboard Glass List */}
        <View className="mb-8 px-6">
          <View className="rounded-[32px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <View className="mb-4 flex-row items-center px-2">
              <View className="mr-2 h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />
              <Text
                style={{ fontSize: rf(1) }}
                className="font-main-bold uppercase tracking-widest text-white/40"
              >
                Squad Rankings
              </Text>
            </View>
            <Leaderboard
              sortedScores={sortedScores}
              playerNames={playerNamesList}
              selectedImages={selectedImages}
            />
          </View>
        </View>

        {/* 3. Action Buttons — Play Again + Share (same as offline) */}
        <View className="px-6">
          <ActionButtons
            handlePlayAgain={onPlayAgain}
            handleShare={handleShare}
            isButtonDisabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * --- CHOR POLICE MULTIPLAYER SCREEN ---
 *
 * CORRECT FLOW:
 * 1. "waiting"     → ALL see board + "Press me to play!" button
 * 2. "dealing"     → ALL see SAME board: Police card flips → popup → King card flips → popup
 * 3. "police_turn" → NOW the split:
 *                     - Police: board (can click hidden cards)
 *                     - King: board (spectator, can't click)
 *                     - Thief: big thief.png card (RoleRevealView)
 *                     - Advisor: big advisor.png card (RoleRevealView)
 * 4. "result"      → ALL see board with all cards revealed + win/lose GIF
 * 5. "round_video" → Intro video between rounds
 * 6. "score_quiz"  → Each player guesses their total score (+2000/-2000)
 * 7. "final_result"→ Final leaderboard with winner spotlight
 * 8. "finished"    → Navigate home
 */
const ChorPoliceMultiplayerScreen = () => {
  const insets = useSafeAreaInsets();
  const g = useChorPoliceMultiplayer();

  /* ─── Hardware Back ─── */
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      g.handleQuitInMiddle();
      return true;
    });
    return () => sub.remove();
  }, [g.handleQuitInMiddle]);

  /* ═══════════════════════════════════════════════
     RENDER — phase-based, then role-based split
  ═══════════════════════════════════════════════ */
  const renderContent = () => {
    const { gamePhase, myRole, canSeeBoard } = g;

    /* ─── WAITING: ALL see board + Play button ─── */
    if (gamePhase === "waiting") {
      return (
        <GamePlaySection
          isPlayButtonDisabled={g.isPlayButtonDisabled}
          handlePlay={g.handlePlay}
          roles={g.roles}
          playerNames={g.playerNames}
          flippedStates={g.flippedStates}
          clickedCards={g.clickedCards}
          handleCardClick={() => {}}
          handleCardClickWithBounce={() => {}}
          toggleModal={g.toggleModal}
          round={g.round}
          message={g.message || null}
          getCardStyle={g.getCardStyle}
          showTableButton={g.showTableButton}
        />
      );
    }

    /* ─── DEALING: ALL see the SAME board with flip animations + popups ─── */
    if (gamePhase === "dealing") {
      // NO role split here — everyone sees the board
      return renderBoardWithPopups();
    }

    /* ─── POLICE TURN: NOW the role split happens ─── */
    if (gamePhase === "police_turn") {
      // Thief/Advisor: see their big private role card (thief.png / advisor.png)
      if (!canSeeBoard && myRole) {
        return <RoleRevealView role={myRole} round={g.round} />;
      }

      // Police/King: see the board
      return renderBoardWithPopups();
    }

    /* ─── ROUND VIDEO: Play intro video between rounds ─── */
    if (gamePhase === "round_video") {
      return <VideoPlayerComponent videoIndex={1} onVideoEnd={g.handleVideoEnd} />;
    }

    /* ─── RESULT: ALL see the board ─── */
    if (gamePhase === "result") {
      return renderBoardWithPopups();
    }

    /* ─── SCORE QUIZ: Each player guesses their total score ─── */
    if (gamePhase === "score_quiz") {
      return renderScoreQuiz();
    }

    /* ─── FINAL RESULT: Show leaderboard with winner ─── */
    if (gamePhase === "final_result" || gamePhase === "finished") {
      return renderFinalResult();
    }

    return null;
  };

  /**
   * Renders the score-guessing quiz.
   * Matches offline Rajamantriquizscreen.tsx EXACTLY:
   * - When popup is active → DynamicOverlayPopUp takes over FULL screen
   * - When no popup → show PlayerInfo + QuizOptions
   * - All players SEE each question, but only active player can click
   * - Non-active players and bots see a "wait" message
   */
  const renderScoreQuiz = () => {
    const players = ChorPoliceEngine.state.players;
    const currentPlayer = players[g.quizPlayerIndex];

    if (!currentPlayer) return null;

    const avatarId = currentPlayer.avatarId;
    const playerImage = playerImages[avatarId] || playerImages[1];
    const isBotTurn = !!currentPlayer.isBot;
    // In current multiplayer, host is always the only real player
    const isMyTurn = currentPlayer.id === g.localPlayerId;

    // ─── When popup is active → full screen takeover (EXACTLY like offline) ───
    if (g.isDynamicPopUp && g.mediaId != null && g.mediaType != null) {
      return (
        <DynamicOverlayPopUp
          isPopUp={g.isDynamicPopUp}
          mediaId={g.mediaId}
          mediaType={g.mediaType}
          closeVisibleDelay={3000}
          playerData={g.playerData}
        />
      );
    }

    // ─── Quiz content (EXACTLY like offline layout) ───
    return (
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(5) }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-5">
            {/* Player Stage — same as offline */}
            <View className="relative mb-10 items-center justify-center">
              {/* Subtle spotlight glow behind player info */}
              <View
                style={{
                  width: wp(60),
                  height: hp(15),
                  position: "absolute",
                  top: 0,
                }}
                className="rounded-full bg-indigo-500/10 blur-3xl"
              />
              <PlayerInfo playerImage={playerImage} />
              {/* Player name tag */}
              <View className="mt-2 items-center">
                <Text
                  style={{ fontSize: rf(2) }}
                  className="font-main-bold text-white tracking-wider"
                >
                  {currentPlayer.name}
                </Text>
                <Text
                  style={{ fontSize: rf(1) }}
                  className="font-main-bold text-white/40 uppercase tracking-[4px] mt-1"
                >
                  Player {g.quizPlayerIndex + 1} of {players.length}
                </Text>
              </View>
            </View>

            {/* Glass Interface — same as offline */}
            <View
              className="relative w-full overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.05]"
              style={{
                paddingVertical: hp(4),
                paddingHorizontal: wp(2),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.5,
                shadowRadius: 30,
                elevation: 10,
              }}
            >
              {/* Top specular shine */}
              <View className="absolute left-0 right-0 top-0 h-[1px] bg-white/30" />

              {isBotTurn ? (
                /* Bot turn — everyone sees thinking message */
                <View className="items-center py-8">
                  <Text
                    style={{ fontSize: rf(2) }}
                    className="font-main-bold text-white/60"
                  >
                    🤖 {currentPlayer.name} is thinking...
                  </Text>
                  <Text
                    style={{ fontSize: rf(1.2) }}
                    className="font-main-md text-white/30 mt-3"
                  >
                    Wait for {currentPlayer.name} to guess their score
                  </Text>
                </View>
              ) : isMyTurn ? (
                /* My turn — I can click the options */
                <QuizOptions
                  playerName={currentPlayer.name}
                  options={g.quizOptions}
                  onOptionPress={g.handleQuizOption}
                  isOptionDisabled={g.quizOptionDisabled}
                />
              ) : (
                /* Another real player's turn — show "wait" message */
                <View className="items-center py-8">
                  <Text
                    style={{ fontSize: rf(2) }}
                    className="font-main-bold text-white/60"
                  >
                    ⏳ {currentPlayer.name} is guessing...
                  </Text>
                  <Text
                    style={{ fontSize: rf(1.2) }}
                    className="font-main-md text-white/30 mt-3"
                  >
                    You can't click — wait for their turn to finish
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  /**
   * Renders the final leaderboard — delegates to FinalResultView component
   * (must be a real component because it uses hooks)
   */
  const renderFinalResult = () => {
    return (
      <FinalResultView
        onExit={g.handleFinalExit}
        onPlayAgain={g.handlePlayAgain}
      />
    );
  };

  /**
   * Renders the game board with cards, popups, score table.
   * Used by Police/King during dealing/police_turn, and by everyone during result.
   */
  const renderBoardWithPopups = () => {
    // Win/Lose GIF overlay takes over the screen
    if (g.isDynamicPopUp && g.mediaId != null && g.mediaType != null) {
      return (
        <DynamicOverlayPopUp
          isPopUp={g.isDynamicPopUp}
          mediaId={g.mediaId}
          mediaType={g.mediaType}
          closeVisibleDelay={3000}
          playerData={g.playerData}
        />
      );
    }

    return (
      <>
        {/* Score table modal */}
        <ScoreTable
          playerNames={g.playerNames}
          playerScores={g.playerScores}
          popupTable={g.popupTable}
          onClose={() => g.setPopupTable(false)}
        />

        {/* King/Police reveal popups (OverlayPopUp) */}
        {g.popupIndex != null && (
          <OverlayPopUp
            index={g.popupIndex}
            policeIndex={g.policeIndex}
            kingIndex={g.kingIndex}
            advisorIndex={g.advisorIndex}
            thiefIndex={g.thiefIndex}
            displayDuration={3500}
          />
        )}

        {/* Game board with 4 cards */}
        <View className="flex-1">
          <GamePlaySection
            isPlayButtonDisabled={g.isPlayButtonDisabled}
            handlePlay={g.handlePlay}
            roles={g.roles}
            playerNames={g.playerNames}
            flippedStates={g.flippedStates}
            clickedCards={g.clickedCards}
            handleCardClick={g.canInteract ? g.handleCardClick : () => {}}
            handleCardClickWithBounce={g.canInteract ? g.handleCardClickWithBounce : () => {}}
            toggleModal={g.toggleModal}
            round={g.round}
            message={
              g.gamePhase === "result"
                ? "Round Complete!"
                : g.canInteract
                  ? `Hey ${g.playerNames[0] || "Player"}, you are Police! Tap a card to reveal the Thief 🔍`
                  : g.gamePhase === "police_turn"
                    ? "Watching the investigation..."
                    : null
            }
            getCardStyle={g.getCardStyle}
            showTableButton={g.showTableButton}
          />
        </View>
      </>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/70" />

      <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {renderContent()}
      </View>

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
