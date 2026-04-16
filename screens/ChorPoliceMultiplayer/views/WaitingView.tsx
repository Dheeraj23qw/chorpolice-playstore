import React from "react";
import { GamePlaySection } from "../GamePlaySection";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Waiting Phase:
 * All players see board + Play button
 */
const WaitingView = ({ g }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
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
    </View>
  );
};

export default WaitingView;
