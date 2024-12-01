import React, { useEffect, useState } from "react";
import {
  View,
  ImageBackground,
  ScrollView,
  Animated,
  StatusBar,
  BackHandler,
} from "react-native";

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
import CustomModal from "@/modal/CustomModal";
import CustomButton from "@/components/CustomButton";
import ScoreTable from "@/modal/ShowTableModal";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";

// Animation imports
import { bounceAnimation, flipAndBounceStyle } from "@/Animations/animation";
import { RootState } from "@/redux/store";
import { setIsThinking } from "@/redux/reducers/botReducer";
import useRandomMessage from "@/hooks/useRandomMessage";
import { useRouter } from "expo-router";
const RajaMantriGameScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

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
    randomMessageThinking,
    handleResetgame,
    setPopupIndex
  } = useRajaMantriGame({ playerNames });

  const [popupTable, setPopupTable] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const [bounceAnims] = useState(playerNames.map(() => new Animated.Value(1)));

  const isBotThinking = useSelector((state: RootState) => state.bot.isThinking);
  const selectedImages = useSelector(selectSelectedImages);
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );

  // Toggle modal visibility
  const toggleModal = () => setPopupTable(!popupTable);
  const toggleExitModal = () => setExitModalVisible(!exitModalVisible);

  // Handle game exit
  const handleExitGame = async () => {
    setPopupIndex(null)
    handleResetgame()
    router.replace("/modeselect"); // Replace with your actual route
    toggleExitModal();
  };

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (exitModalVisible) {
        setExitModalVisible(false);
        return true; // Prevent default behavior
      }
      toggleExitModal(); // Show exit modal
      return true; // Prevent default back navigation
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, [exitModalVisible]);

  // Function to handle card click with bounce animation
  const handleCardClickWithBounce = (index: number) => {
    bounceAnimation(bounceAnims[index]).start();
  };
  const getCardStyle = (index: number) =>
    flipAndBounceStyle(flipAnims[index], bounceAnims[index]);

 
  useEffect(() => {
    if (isBotThinking && policeIndex != null) {
      const timer = setTimeout(() => {
        dispatch(setIsThinking(false));
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      dispatch(setIsThinking(false));
    }
  }, [isBotThinking]);

  return (
    <>
      <ScoreTable
        playerNames={playerNames}
        playerScores={playerScores}
        popupTable={popupTable}
      />
      <CustomModal
        visible={exitModalVisible}
        onClose={toggleExitModal}
        title="Exit Game"
        content="Do you want to exit the game?"
        buttons={[
          { text: "Yes", onPress: handleExitGame },
          { text: "No", onPress: toggleExitModal },
        ]}
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
              message: randomMessageThinking,
            }}
          />
        </ImageBackground>
      )}

      {isDynamicPopUp && mediaId != null && mediaType != null && (
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
              <StatusBar backgroundColor={"transparent"} />

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
