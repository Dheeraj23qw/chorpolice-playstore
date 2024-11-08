import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, View, ImageBackground, StatusBar } from "react-native";

import { globalstyles } from "@/styles/global";
import { chorPoliceQuizstyles } from "./quizStyle";
import { useRouter } from "expo-router";
import { Components } from "@/imports/allComponentImports";
import useQuizLogic from "@/hooks/useQuizLogic";
import { responsiveHeight } from "react-native-responsive-dimensions";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";

const ChorPoliceQuiz: React.FC = () => {
  const router = useRouter();

  const {
    currentPlayer,
    playerImage,
    options,
    handleOptionPress,
    isOptionDisabled,
    currentPlayerIsBot,
    isPopUp,
    mediaType,
    mediaId,
    currentPlayerName,
    currentPlayerImage,
    currentPlayerImageType,
  } = useQuizLogic(router);
  return (
    <>
      {isPopUp ? (
        <>
          <DynamicOverlayPopUp
            isPopUp={isPopUp}
            mediaId={mediaId}
            mediaType={mediaType}
            playerData={{
              image: currentPlayerImage,
              message: `Congratulation! \n${currentPlayerName}`,
              imageType: currentPlayerImageType,
            }}
          />
        </>
      ) : (
        <SafeAreaView style={globalstyles.container}>
          <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
            <Components.ScreenHeader name="Quiz Time" showBackButton={false} />
          </View>

          <View style={[globalstyles.Container2, { flex: 10 }]}>
            <View style={chorPoliceQuizstyles.overlay} />
            <ImageBackground
              source={require("../../assets/images/bg/quiz.png")}
              style={chorPoliceQuizstyles.imageBackground}
              resizeMode="cover"
            >
              <View style={chorPoliceQuizstyles.overlay} />
              <View style={chorPoliceQuizstyles.quizContainer}>
                {/* Player Info */}
                <Components.PlayerInfo playerImage={playerImage} />

                <Components.QuizOptions
                  playerName={currentPlayer.name}
                  options={options}
                  onOptionPress={handleOptionPress}
                  isOptionDisabled={isOptionDisabled}
                  currentPlayerIsBot={currentPlayerIsBot}
                />
              </View>
            </ImageBackground>
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

export default ChorPoliceQuiz;
