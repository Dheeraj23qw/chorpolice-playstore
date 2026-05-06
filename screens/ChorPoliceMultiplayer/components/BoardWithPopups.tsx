import React from "react";
import { View } from "react-native";

import OverlayPopUp from "@/modal/overlaypop";

import { GamePlaySection } from "../GamePlaySection";
import CinematicReveal from "./CinematicReveal";

/**
 * Handles:
 * - Board rendering
 * - Popups
 * - Score table
 */
const BoardWithPopups = ({ g }: any) => {
  // Full screen popup (win/lose GIF etc.)
  if (g.isDynamicPopUp && g.mediaId != null) {
    return (
      <OverlayPopUp
        index={g.popupIndex}
        policeIndex={g.policeIndex}
        kingIndex={g.kingIndex}
        advisorIndex={g.advisorIndex}
        thiefIndex={g.thiefIndex}
        displayDuration={2500} // Snappier 2.5s
        revealedRole={g.revealData?.role}
        isCorrect={g.revealData?.isCorrect}
      />
    );
  }

  return (
    <>
      {/* Role Reveal Popup */}
      {g.popupIndex === 5 && g.revealData && (
        <CinematicReveal
          index={g.revealData.index}
          role={g.revealData.role}
          isCorrect={g.revealData.isCorrect}
          policeName={g.playerNames[g.policeIndex]}
          advisorName={g.playerNames[g.advisorIndex]}
          onComplete={() => {}} // Hook handles timing
        />
      )}

      {g.popupIndex != null && g.popupIndex !== 5 && (
        <OverlayPopUp
          index={g.popupIndex}
          policeIndex={g.policeIndex}
          kingIndex={g.kingIndex}
          advisorIndex={g.advisorIndex}
          thiefIndex={g.thiefIndex}
          displayDuration={2500} // Snappier 2.5s
          revealedRole={g.revealData?.role}
          isCorrect={g.revealData?.isCorrect}
        />
      )}

      {/* Game Board */}
      <View className="flex-1 bg-transparent">
        <GamePlaySection
          isPlayButtonDisabled={g.isPlayButtonDisabled}
          handlePlay={g.handlePlay}
          roles={g.roles}
          playerNames={g.playerNames}
          flippedStates={g.flippedStates}
          clickedCards={g.clickedCards}
          handleCardClick={g.canInteract ? g.handleCardClick : () => {}}
          handleCardClickWithBounce={
            g.canInteract ? g.handleCardClickWithBounce : () => {}
          }
          toggleModal={g.toggleModal}
          round={g.round}
          message={(() => {
            if (g.gamePhase === "result") return "Round Complete!";
            if (g.gamePhase === "police_turn") {
              const policeName = g.playerNames[g.policeIndex] || "Police";
              return `${policeName}, find the Thief! 🔍`;
            }
            return g.canInteract ? "Find the Thief! 🔍" : "Watching...";
          })()}
          getCardStyle={g.getCardStyle}
          showTableButton={g.showTableButton}
          isHighlight={g.gamePhase === "police_turn" && g.canInteract}
          invisibleIndices={g.invisibleIndices}
          localPlayerName={g.localPlayerName}
          myRole={g.myRole}
        />
      </View>
    </>
  );
};

export default BoardWithPopups;
