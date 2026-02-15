import React, { useEffect, useState } from "react";
import {
  View,
  Animated,
  BackHandler,
  Alert,
} from "react-native";

// Redux
import { useSelector } from "react-redux";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";

// Hooks
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";

// Components
import OverlayPopUp from "@/modal/overlaypop";
import ScoreTable from "@/modal/ShowTableModal";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { GamePlaySection } from "./GameplaySection";

// Animation imports
import { bounceAnimation, flipAndBounceStyle } from "@/Animations/animation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AudioEngine } from "@/audio/audioEngine";
import RoundStartLoader from "@/components/RoundStartLoader";

const RajaMantriGameScreen: React.FC = () => {
  const playerNames = useSelector(selectPlayerNames).map(
    (player) => player.name,
  );

  const {
    flipAnims,
    flippedStates,
    clickedCards,
    message,
    roles,
    isPlayButtonDisabled,
    playerScores,
    round,
    handlePlay,
    handleCardClick,
    policeIndex,
    kingIndex,
    advisorIndex,
    thiefIndex,
    popupIndex,
    isDynamicPopUp,
    mediaId,
    mediaType,
    playerData,
    isRoundStartPopupVisible,
    handleExitGame,
    isGameReset,
    handleResetgame,
    showTableButton,
  } = useRajaMantriGame({ playerNames });

  /* ---------------- RESET GAME ---------------- */
  useEffect(() => {
    if (!isGameReset) return;

    AudioEngine.stopAllExceptQuiz();
    handleResetgame();
    router.replace("/mode-select");
  }, [isGameReset]);

  /* ---------------- HARDWARE BACK ---------------- */
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Hold on!",
        "Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "YES", onPress: () => handleExitGame() },
        ],
        { cancelable: true },
      );

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => subscription.remove();
  }, []);

  const [popupTable, setPopupTable] = useState(false);
  const [bounceAnims] = useState(playerNames.map(() => new Animated.Value(1)));

  const toggleModal = () => setPopupTable(!popupTable);

  const handleCardClickWithBounce = (index: number) => {
    bounceAnimation(bounceAnims[index]).start();
  };

  const getCardStyle = (index: number) =>
    flipAndBounceStyle(flipAnims[index], bounceAnims[index]);

  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-[#050508]"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {isDynamicPopUp && mediaId != null && mediaType != null ? (
        <DynamicOverlayPopUp
          isPopUp={isDynamicPopUp}
          mediaId={mediaId}
          mediaType={mediaType}
          closeVisibleDelay={3000}
          playerData={playerData}
        />
      ) : (
        <>
          <ScoreTable
            playerNames={playerNames}
            playerScores={playerScores}
            popupTable={popupTable}
            onClose={() => setPopupTable(false)}
          />

          {popupIndex && (
            <OverlayPopUp
              index={popupIndex}
              policeIndex={policeIndex}
              kingIndex={kingIndex}
              advisorIndex={advisorIndex}
              thiefIndex={thiefIndex}
              displayDuration={3000}
            />
          )}

          {isRoundStartPopupVisible && <RoundStartLoader />}

          <View className="flex-1">
            <GamePlaySection
              isPlayButtonDisabled={isPlayButtonDisabled}
              handlePlay={handlePlay}
              roles={roles}
              playerNames={playerNames}
              flippedStates={flippedStates}
              clickedCards={clickedCards}
              handleCardClick={handleCardClick}
              handleCardClickWithBounce={handleCardClickWithBounce}
              toggleModal={toggleModal}
              round={round}
              message={message}
              getCardStyle={getCardStyle}
              showTableButton={showTableButton}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default React.memo(RajaMantriGameScreen);
