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
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";

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
    winner
  } = useSortedScores();

  const onPlayAgain = useCallback(handlePlayAgain, [handlePlayAgain]);
  const onBack = useCallback(handleBack, [handleBack]);
  const onShare = useCallback(handleShare, [handleShare]);

  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const gamemode = useSelector((state: RootState) => state.player.gameMode);

  useEffect(() => {
    if (gamemode === "ONLINE_WITH_BOTS") {
      setIsDynamicPopUp(true);

      const timeout = setTimeout(() => {
        setIsDynamicPopUp(false);
      }, 5000);

      return () => clearTimeout(timeout); // Cleanup
    }
  }, [gamemode]);

  return (
    <>
      {isDynamicPopUp && winnerImage != null ? (
        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={[chorPoliceQuizstyles.imageBackground, { flex: 1 }]}
          resizeMode="cover"
        >
          <DynamicOverlayPopUp
            isPopUp={isDynamicPopUp}
            mediaId={12}
            mediaType={"gif"}
            closeVisibleDelay={5000}
            playerData={{
              image: winnerImage,
              message: `${winnerName}, you have won 1000 coins!`,
              imageType: winnerPlayerImageType,
            }}
          />
        </ImageBackground>
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
                  isButtonDisabled={isButtonDisabled} // Pass the disabled state here
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
