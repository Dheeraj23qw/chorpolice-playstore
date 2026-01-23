import React, { memo, useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  View,
  ImageBackground,
} from "react-native";
import { globalstyles } from "@/styles/global";
import { useSortedScores } from "@/hooks/useSortedScores";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { addCoins } from "@/redux/reducers/coinsReducer";
import { SafeAreaView } from "react-native-safe-area-context";
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { ActionButtons } from "@/components/leaderBoardScreen/ActionButtons";

// Constants
const REWARD_POINTS = 1000;
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
  } = useSortedScores();

  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);

  

  const onPlayAgain = useCallback(handlePlayAgain, [handlePlayAgain]);
  const onBack = useCallback(handleBack, [handleBack]);
  const onShare = useCallback(handleShare, [handleShare]);

 

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
const MemoizedWinnerSection = memo(WinnerSection);
const MemoizedLeaderboard = memo(Leaderboard);
const MemoizedActionButtons = memo(ActionButtons);

export default memo(ChorPoliceResult);
