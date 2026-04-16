import React from "react";
import { GamePlaySection } from "../GamePlaySection";

/**
 * Waiting Phase:
 * All players see board + Play button
 */
const WaitingView = ({ g }: any) => {
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
};

export default WaitingView;
