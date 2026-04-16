import React from "react";
import { View } from "react-native";

import ScoreTable from "@/modal/ShowTableModal";
import OverlayPopUp from "@/modal/overlaypop";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";

import { GamePlaySection } from "../GamePlaySection";

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
      {/* Score Table */}
      <ScoreTable
        playerNames={g.playerNames}
        playerScores={g.playerScores}
        popupTable={g.popupTable}
        onClose={() => g.setPopupTable(false)}
      />

      {/* Role Reveal Popup */}
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

      {/* Game Board */}
      <View className="flex-1">
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
          message={
            g.gamePhase === "result"
              ? "Round Complete!"
              : g.canInteract
                ? "Tap a card to reveal the Thief 🔍"
                : "Watching..."
          }
          getCardStyle={g.getCardStyle}
          showTableButton={g.showTableButton}
        />
      </View>
    </>
  );
};

export default BoardWithPopups;
