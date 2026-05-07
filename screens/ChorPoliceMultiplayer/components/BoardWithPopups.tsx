import React from "react";
import { View } from "react-native";

import OverlayPopUp from "@/modal/overlaypop";

import CinematicReveal from "./CinematicReveal";
import { GamePlaySection } from "./GamePlaySection";

const BoardWithPopups = ({ g }: any) => {
  if (g.isDynamicPopUp && g.mediaId != null) {
    return (
      <OverlayPopUp
        index={g.popupIndex}
        policeIndex={g.policeIndex}
        kingIndex={g.kingIndex}
        advisorIndex={g.advisorIndex}
        thiefIndex={g.thiefIndex}
        displayDuration={2500}
        revealedRole={g.revealData?.role}
        isCorrect={g.revealData?.isCorrect}
      />
    );
  }

  return (
    <>
      {g.popupIndex === 5 && g.revealData && (
        <CinematicReveal
          index={g.revealData.index}
          role={g.revealData.role}
          isCorrect={g.revealData.isCorrect}
          policeName={g.playerNames[g.policeIndex]}
          advisorName={g.playerNames[g.advisorIndex]}
          onComplete={() => {}}
        />
      )}

      {g.popupIndex != null && g.popupIndex !== 5 && (
        <OverlayPopUp
          index={g.popupIndex}
          policeIndex={g.policeIndex}
          kingIndex={g.kingIndex}
          advisorIndex={g.advisorIndex}
          thiefIndex={g.thiefIndex}
          displayDuration={2500}
          revealedRole={g.revealData?.role}
          isCorrect={g.revealData?.isCorrect}
        />
      )}

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
            if (g.gamePhase === "investigation_shuffle") {
              return g.canInteract
                ? "Catch the Thief and stay away from Joker."
                : "Mystery cards are shuffling...";
            }
            if (g.gamePhase === "police_turn") {
              return g.canInteract
                ? "Catch the Thief and stay away from Joker."
                : "Police is investigating...";
            }
            return (
              g.message || (g.canInteract ? "Find the Thief!" : "Watching...")
            );
          })()}
          getCardStyle={g.getCardStyle}
          showTableButton={g.showTableButton}
          isHighlight={g.gamePhase === "police_turn" && g.canInteract}
          invisibleIndices={g.invisibleIndices}
          localPlayerName={g.localPlayerName}
          myRole={g.myRole}
          gamePhase={g.gamePhase}
          investigationTargets={g.investigationTargets}
          popupIndex={g.popupIndex}
          dealAnimationPreset={g.dealAnimationPreset}
        />
      </View>
    </>
  );
};

export default BoardWithPopups;
