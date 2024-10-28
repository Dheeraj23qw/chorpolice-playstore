import React, { memo, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
  ImageBackground,
} from "react-native";
import { globalstyles } from "@/styles/global";
import ScreenHeader from "@/components/_screenHeader";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { ActionButtons } from "@/components/leaderBoardScreen/ActionButtons";
import { useSortedScores } from "@/hooks/useSortedScores";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";

const ChorPoliceResult = () => {
  const {
    sortedScores,
    playerNames,
    selectedImages,
    handlePlayAgain,
    handleBack,
    handleShare,
    isButtonDisabled,
  } = useSortedScores();

  // Memoize callbacks to avoid unnecessary re-renders
  const onPlayAgain = useCallback(handlePlayAgain, [handlePlayAgain]);
  const onBack = useCallback(handleBack, [handleBack]);
  const onShare = useCallback(handleShare, [handleShare]);
  return (
    <SafeAreaView style={globalstyles.container}>
      <StatusBar backgroundColor="#8E5DE9" barStyle="dark-content" />
      <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
        <ScreenHeader name="Game Result" showBackButton={false} />
      </View>
      <View style={[globalstyles.Container2, { flex: 10 }]}>
        <View style={chorPoliceQuizstyles.overlay} />
        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={chorPoliceQuizstyles.imageBackground}
          resizeMode="cover"
        >
          <View style={chorPoliceQuizstyles.overlay} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <MemoizedWinnerSection
              sortedScores={sortedScores}
              playerNames={playerNames}
              selectedImages={selectedImages}
            />
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
  );
};

// Memoize components to prevent unnecessary re-renders
const MemoizedWinnerSection = memo(WinnerSection);
const MemoizedLeaderboard = memo(Leaderboard);
const MemoizedActionButtons = memo(ActionButtons);

export default memo(ChorPoliceResult);
