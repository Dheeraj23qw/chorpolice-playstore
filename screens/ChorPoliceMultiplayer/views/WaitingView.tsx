import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GamePlaySection } from "../components/GamePlaySection";

/**
 * Waiting Phase:
 * All players see board + Play button
 */
const WaitingView = ({ g, setIsRulesVisible }: any) => {
  const insets = useSafeAreaInsets();
  const isWaitingForHost = !g.isHost;

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <GamePlaySection
        isPlayButtonDisabled={isWaitingForHost || g.isPlayButtonDisabled}
        handlePlay={g.handlePlay}
        roles={g.roles}
        playerNames={g.playerNames}
        flippedStates={g.flippedStates}
        clickedCards={g.clickedCards}
        handleCardClick={() => {}}
        handleCardClickWithBounce={() => {}}
        toggleModal={g.toggleModal}
        setIsRulesVisible={setIsRulesVisible}
        round={g.round}
        message={isWaitingForHost ? "Waiting for host..." : g.message || null}
        getCardStyle={g.getCardStyle}
        showTableButton={g.showTableButton}
        localPlayerIndex={g.localPlayerIndex}
      />
    </View>
  );
};

export default WaitingView;
