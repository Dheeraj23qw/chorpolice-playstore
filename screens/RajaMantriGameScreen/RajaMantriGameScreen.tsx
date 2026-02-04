import React, { useEffect, useState } from "react";
import {
  View,
  ImageBackground,
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
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/qiuzStyle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import VideoPlayerComponent from "@/components/IntroVideo";
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
    handleExitGame,
    isGameReset,
    handleResetgame,
    showTableButton,
  } = useRajaMantriGame({ playerNames });

  useEffect(() => {
    if (!isGameReset) return;

    AudioEngine.stopAllExceptQuiz();

    handleResetgame();

    router.replace("/modeselect");
  }, [isGameReset]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Hold on!",
        "Are you sure you want to go back?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "YES",
            onPress: () => handleExitGame(),
          },
        ],
        { cancelable: true },
      );

      return true; // prevent default back behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => subscription.remove();
  }, []);

  const [popupTable, setPopupTable] = useState(false);
  const [bounceAnims] = useState(playerNames.map(() => new Animated.Value(1)));

  // Toggle modal visibility
  const toggleModal = () => setPopupTable(!popupTable);

  // Function to handle card click with bounce animation
  const handleCardClickWithBounce = (index: number) => {
    bounceAnimation(bounceAnims[index]).start();
  };

  const getCardStyle = (index: number) =>
    flipAndBounceStyle(flipAnims[index], bounceAnims[index]);

  const insets = useSafeAreaInsets();

  return (
    <View
      className={`flex-1 ${isPlaying ? "bg-white" : "bg-[#020205]"}`}
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
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
        <View className="flex-1">
          {isPlaying ? (
            <VideoPlayerComponent
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
              toggleModal={toggleModal}
              round={round}
              message={message}
              getCardStyle={getCardStyle}
              showTableButton={showTableButton}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default React.memo(RajaMantriGameScreen);
