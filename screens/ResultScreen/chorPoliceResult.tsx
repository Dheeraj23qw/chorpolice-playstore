import React, { memo, useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
  ImageBackground,
} from "react-native";
import { globalstyles } from "@/styles/global";
import { Components } from "@/imports/allComponentImports";
import { useSortedScores } from "@/hooks/useSortedScores";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { addCoins } from "@/redux/reducers/coinsReducer";

// Constants
const REWARD_POINTS = 1000;
const GAME_MODE_BOTS = "ONLINE_WITH_BOTS";
const POPUP_TIMEOUT = 5000;

const ChorPoliceResult = () => {
  const {
    sortedScores,
    playerNames,
    selectedImages,
    handlePlayAgain,
    handleBack,
    handleShare,
    isButtonDisabled,
    winnerName,
    winnerImage,
    winnerPlayerImageType,
    winner,
    isCurrentWinnerIsBot,
  } = useSortedScores();

  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);

  const gamemode = useSelector((state: RootState) => state.player.gameMode);
  const dispatch = useDispatch();

  const onPlayAgain = useCallback(handlePlayAgain, [handlePlayAgain]);
  const onBack = useCallback(handleBack, [handleBack]);
  const onShare = useCallback(handleShare, [handleShare]);

  useEffect(() => {
    if (gamemode === GAME_MODE_BOTS) {
      setIsDynamicPopUp(true);

      if (!isCurrentWinnerIsBot) {
        dispatch(addCoins(REWARD_POINTS));
      }

      const timeout = setTimeout(() => {
        setIsDynamicPopUp(false);
      }, POPUP_TIMEOUT);

      return () => clearTimeout(timeout);
    }
  }, []);

  const renderDynamicPopUp = () => {
    const winnerMessage = `${winnerName}, you have won ${REWARD_POINTS} coins!`;

    return (
      <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        style={[chorPoliceQuizstyles.imageBackground, { flex: 1 }]}
        resizeMode="cover"
      >
        <DynamicOverlayPopUp
          isPopUp={isDynamicPopUp}
          mediaId={12}
          mediaType="gif"
          closeVisibleDelay={POPUP_TIMEOUT}
          playerData={{
            image: winnerImage,
            message: winnerMessage,
            imageType: winnerPlayerImageType,
          }}
        />
      </ImageBackground>
    );
  };

  return (
    <>
      {isDynamicPopUp && winnerImage && winnerPlayerImageType ? (
        renderDynamicPopUp()
      ) : (
        <SafeAreaView style={globalstyles.container}>
          <StatusBar backgroundColor="#7653ec" barStyle="dark-content" />
          <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
            <Components.ScreenHeader
              name="Who's the Winner?"
              showBackButton={false}
            />
          </View>
          <View style={[globalstyles.Container2, { flex: 10 }]}>
            <View style={chorPoliceQuizstyles.overlay} />
            <ImageBackground
              source={require("../../assets/images/bg/quiz.png")}
              style={chorPoliceQuizstyles.imageBackground}
              resizeMode="cover"
            >
              <View style={chorPoliceQuizstyles.overlay} />
              <MemoizedWinnerSection
                winnerName={winnerName}
                winnerImage={winnerImage}
                winner={winner}
              />
              <ScrollView showsVerticalScrollIndicator={false}>
                <MemoizedLeaderboard
                  sortedScores={sortedScores}
                  playerNames={playerNames}
                  selectedImages={selectedImages}
                />
                <MemoizedActionButtons
                  handlePlayAgain={onPlayAgain}
                  handleBack={onBack}
                  handleShare={onShare}
                  isButtonDisabled={isButtonDisabled}
                />
              </ScrollView>
            </ImageBackground>
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

// Memoize components to prevent unnecessary re-renders
const MemoizedWinnerSection = memo(Components.WinnerSection);
const MemoizedLeaderboard = memo(Components.Leaderboard);
const MemoizedActionButtons = memo(Components.ActionButtons);

export default memo(ChorPoliceResult);
