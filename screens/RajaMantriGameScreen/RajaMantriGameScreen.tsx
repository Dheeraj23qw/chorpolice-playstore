import React, { useEffect, useState } from "react";
import { View, ImageBackground, ScrollView, Animated } from "react-native";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { selectPlayerNames } from "@/redux/slices/selectors";

// Hooks
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";

// Styles
import { styles } from "./styles";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";

// Components
import { Components } from "@/imports/allComponentImports";
import OverlayPopUp from "@/modal/overlaypop";
import useBackHandlerModal from "@/hooks/useBackHandlerModal";
import CustomModal from "@/modal/CustomModal";
import CustomButton from "@/components/CustomButton";
import ScoreTable from "@/modal/ShowTableModal";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";

// Animation imports
import { bounceAnimation, flipAndBounceStyle } from "@/Animations/animation";

const RajaMantriGameScreen: React.FC = () => {
  const playerNames = useSelector(selectPlayerNames).map(
    (player) => player.name
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
    videoIndex,
    isPlaying,
    handlePlay,
    setIsPlaying,
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
  } = useRajaMantriGame({ playerNames });

  const { modalVisible, setModalVisible, modalButtons } = useBackHandlerModal({
    navigateToScreen: "/playerName",
  });
  const [popupTable, setPopupTable] = useState(false);

  const [bounceAnims] = useState(playerNames.map(() => new Animated.Value(1)));

  const dispatch = useDispatch();

  const toggleModal = () => {
    setPopupTable(!popupTable);
  };

  // Function to handle card click with bounce animation
  const handleCardClickWithBounce = (index: number) => {
    bounceAnimation(bounceAnims[index]).start();
    handleCardClick(index);
  };

  // Use flipAndBounceStyle function to combine animations
  const getCardStyle = (index: number) =>
    flipAndBounceStyle(flipAnims[index], bounceAnims[index]);

  return (
    <>
      <ScoreTable
        playerNames={playerNames}
        playerScores={playerScores}
        popupTable={popupTable}
      />
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Exit Game"
        content="Do you want to exit the game?"
        buttons={modalButtons}
      />
      {popupIndex && (
        <OverlayPopUp
          index={popupIndex}
          policeIndex={policeIndex}
          kingIndex={kingIndex}
          advisorIndex={advisorIndex}
          thiefIndex={thiefIndex}
        />
      )}

      {isDynamicPopUp && (
        <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        style={[chorPoliceQuizstyles.imageBackground, { flex: 1}]}
        resizeMode="cover"
      >
        <DynamicOverlayPopUp
          isPopUp={isDynamicPopUp}
          mediaId={mediaId}
          mediaType={mediaType}
          closeVisibleDelay={3000}
          playerData={playerData}
        />
      </ImageBackground>
      )}

{!isDynamicPopUp && (
        <View style={[styles.container]}>
          {isPlaying ? (
            <Components.VideoPlayerComponent
              videoIndex={videoIndex}
              onVideoEnd={() => setIsPlaying(false)}
            />
          ) : (
            <ImageBackground
              source={require("../../assets/images/bg/quiz.png")}
              style={chorPoliceQuizstyles.imageBackground}
              resizeMode="cover"
            >
              <View style={chorPoliceQuizstyles.overlay} />
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Components.PlayButton
                  disabled={isPlayButtonDisabled}
                  onPress={handlePlay}
                  buttonText={
                    isPlayButtonDisabled
                      ? message
                        ? message
                        : `Round ${round}`
                      : `Press me to play!`
                  }
                />

                <View style={styles.cardRow}>
                  {roles.slice(0, 2).map((_, index) => (
                    <Components.PlayerCard
                      key={index}
                      index={index}
                      role={roles[index]}
                      playerName={playerNames[index]}
                      flipped={flippedStates[index]}
                      clicked={clickedCards[index]}
                      onClick={() => handleCardClickWithBounce(index)}
                      roles={roles}
                      policeIndex={policeIndex}
                      kingIndex={kingIndex}
                      advisorIndex={advisorIndex}
                      thiefIndex={thiefIndex}
                      animatedStyle={getCardStyle(index)}
                    />
                  ))}
                </View>
                <View style={styles.cardRow}>
                  {roles.slice(2).map((_, index) => (
                    <Components.PlayerCard
                      key={index + 2}
                      index={index + 2}
                      role={roles[index + 2]}
                      playerName={playerNames[index + 2]}
                      flipped={flippedStates[index + 2]}
                      clicked={clickedCards[index + 2]}
                      onClick={() => handleCardClickWithBounce(index + 2)}
                      roles={roles}
                      policeIndex={policeIndex}
                      kingIndex={kingIndex}
                      advisorIndex={advisorIndex}
                      thiefIndex={thiefIndex}
                      animatedStyle={getCardStyle(index + 2)}
                    />
                  ))}
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CustomButton label="Scoreboard" onPress={toggleModal} />
                </View>
              </ScrollView>
            </ImageBackground>
          )}
        </View>
      )}
    </>
  );
};

export default React.memo(RajaMantriGameScreen);