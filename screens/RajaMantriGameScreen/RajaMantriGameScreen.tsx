import React, { useEffect, useState, useCallback } from "react";
import { View, ImageBackground, Animated } from "react-native";

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
import OverlayPopUp from "@/modal/overlaypop";
import CustomModal from "@/modal/CustomModal";
import ScoreTable from "@/modal/ShowTableModal";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { GamePlaySection } from "./GameplaySection";

// Animation imports
import { bounceAnimation, flipAndBounceStyle } from "@/Animations/animation";
import { RootState } from "@/redux/store";
import { setIsThinking } from "@/redux/reducers/botReducer";
import { useRouter } from "expo-router";
import { Components } from "@/imports/allComponentImports";


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
    exitModalVisible,
    toggleExitModal,
    handleExitGame,
  } = useRajaMantriGame({ playerNames });

  const [popupTable, setPopupTable] = useState(false);
  const [bounceAnims] = useState(playerNames.map(() => new Animated.Value(1)));

  const isBotThinking = useSelector((state: RootState) => state.bot.isThinking);
  const selectedImages = useSelector(selectSelectedImages);
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );

  // Toggle modal visibility
  const toggleModal = () => setPopupTable(!popupTable);

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
    <View style={{ flex: 1 }}>
     
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
              index={1}
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

          {!isDynamicPopUp && !isBotThinking && (
            <View style={[styles.container]}>
              {isPlaying ? (
                <Components.VideoPlayerComponent
                  videoIndex={videoIndex}
                  onVideoEnd={() => setIsPlaying(false)}
                />
              ) : (
                <GamePlaySection
                  isPlayButtonDisabled={isPlayButtonDisabled}
                  handlePlay={handlePlay}
                  roles={roles}
                  playerNames={playerNames}
                  flippedStates={flippedStates}
                  clickedCards={clickedCards}
                  handleCardClick={handleCardClick}
                  handleCardClickWithBounce={handleCardClickWithBounce}
                  policeIndex={policeIndex}
                  kingIndex={kingIndex}
                  advisorIndex={advisorIndex}
                  thiefIndex={thiefIndex}
                  toggleModal={toggleModal}
                  round={round}
                  message={message}
                  getCardStyle={getCardStyle}
                />
              )}
            </View>
          )}
        
    </View>
  );
};

export default React.memo(RajaMantriGameScreen);
