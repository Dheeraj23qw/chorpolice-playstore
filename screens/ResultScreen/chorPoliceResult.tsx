import React, { memo, useCallback } from "react";
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
const MemoizedWinnerSection = memo(Components.WinnerSection);
const MemoizedLeaderboard = memo(Components.Leaderboard);
const MemoizedActionButtons = memo(Components.ActionButtons);

export default memo(ChorPoliceResult);
