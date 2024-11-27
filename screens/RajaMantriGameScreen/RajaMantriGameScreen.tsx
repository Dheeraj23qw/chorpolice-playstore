import React, { useEffect, useState } from "react";
import { View, ImageBackground, ScrollView, Animated } from "react-native";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  selectPlayerNames,
  selectSelectedImages,
} from "@/redux/selectors/playerDataSelector";

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
import { RootState } from "@/redux/store";
import { setIsThinking } from "@/redux/reducers/botReducer";
import useRandomMessage from "@/hooks/useRandomMessage";
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
    isRoundStartPopupVisible,
    roundStartMessage,
    playerNamesRedux,
    resetGame
  } = useRajaMantriGame({ playerNames });

  const { modalVisible, setModalVisible, modalButtons } = useBackHandlerModal({
    navigateToScreen: "/playerName"
  });
  const [popupTable, setPopupTable] = useState(false);

  const [bounceAnims] = useState(playerNames.map(() => new Animated.Value(1)));
  const dispatch = useDispatch();

  const toggleModal = () => {
    setPopupTable(!popupTable);
  };

  const [status, setStatus] = useState<"win" | "lose" | "thinking">("thinking");
  const [thinkingMsg, setThinkingMsg] = useState<string | null>(null);

  const isBotThinking = useSelector((state: RootState) => state.bot.isThinking);
  const selectedImages = useSelector(selectSelectedImages);
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );

  // Function to handle card click with bounce animation
  const handleCardClickWithBounce = (index: number) => {
    bounceAnimation(bounceAnims[index]).start();
  };
  const getCardStyle = (index: number) =>
    flipAndBounceStyle(flipAnims[index], bounceAnims[index]);

  const randomMessage = useRandomMessage(
    policeIndex != null ? playerNames[policeIndex] : "",
    status
  );

  useEffect(() => {
    // Only set the thinking message if policeIndex is valid and bot is thinking
    if (policeIndex != null && status === "thinking") {
      setThinkingMsg(randomMessage); // Update the message when the bot is thinking
    }
  }, [policeIndex, status, randomMessage]);

  useEffect(() => {
    if (isBotThinking && policeIndex != null) {
      const timer = setTimeout(() => {
        dispatch(setIsThinking(false));
      }, 4000);
      return () => clearTimeout(timer); // Cleanup timer
    } else {
      dispatch(setIsThinking(false));
    }
  }, [isBotThinking, dispatch, policeIndex]);

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
          displayDuration={3000}
        />
      )}
      {isRoundStartPopupVisible && (
        <OverlayPopUp
          index={1} // or you can set a static index if needed
          policeIndex={policeIndex}
          kingIndex={kingIndex}
          advisorIndex={advisorIndex}
          thiefIndex={thiefIndex}
          displayDuration={3000}
          contentType="textOnly"
          customMessage={roundStartMessage}
        />
      )}
      {isBotThinking && policeIndex != null && (
        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={[chorPoliceQuizstyles.imageBackground, { flex: 1 }]}
          resizeMode="cover"
        >
          <DynamicOverlayPopUp
            isPopUp={isBotThinking}
            mediaId={5}
            mediaType={"gif"}
            closeVisibleDelay={7300}
            playerData={{
              image: playerImages[selectedImages[policeIndex]]?.src,
              imageType: playerImages[selectedImages[policeIndex]]?.type,
              message: thinkingMsg,
            }}
          />
        </ImageBackground>
      )}

      {isDynamicPopUp && (
        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={[chorPoliceQuizstyles.imageBackground, { flex: 1 }]}
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
                      onClick={handleCardClick}
                      onBounceEffect={() => handleCardClickWithBounce(index)} // new handler
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
                      onClick={handleCardClick}
                      onBounceEffect={() =>
                        handleCardClickWithBounce(index + 2)
                      } // new handler
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
