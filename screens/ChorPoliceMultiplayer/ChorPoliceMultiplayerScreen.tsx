import React, { useEffect, memo } from "react";
import { View, BackHandler, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChorPoliceMultiplayer } from "@/hooks/useChorPoliceMultiplayer";

// Reuse existing offline components
import OverlayPopUp from "@/modal/overlaypop";
import ScoreTable from "@/modal/ShowTableModal";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { GamePlaySection } from "@/screens/RajaMantriGameScreen/GameplaySection";
import VideoPlayerComponent from "@/components/IntroVideo";
import QuizExitModal from "@/modal/QuizExitModal";

// Role-specific view for Thief/Advisor (big role image after King/Police reveal)
import { RoleRevealView } from "./views/RoleRevealView";

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
 * 5. "finished"    → Navigate home
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

    /* ─── RESULT / FINISHED: ALL see the board ─── */
    if (gamePhase === "result" || gamePhase === "finished") {
      return renderBoardWithPopups();
    }

    return null;
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
                  ? "Tap a card to find the Thief!"
                  : "Watching the investigation..."
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
