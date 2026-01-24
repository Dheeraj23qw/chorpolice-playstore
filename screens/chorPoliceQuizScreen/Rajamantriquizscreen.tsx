import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ImageBackground,
  Animated,
  StatusBar,
} from "react-native";
import { globalstyles } from "@/styles/global";
import { chorPoliceQuizstyles } from "./quizStyle";
import { useRouter } from "expo-router";
import useQuizLogic from "@/hooks/useQuizLogic";
import { responsiveHeight } from "react-native-responsive-dimensions";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { playerNamesArray } from "@/redux/selectors/playerDataSelector";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import PlayerInfo from "@/components/chorPoliceQuiz/playerInfo";
import QuizOptions from "@/components/chorPoliceQuiz/option";

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
    feedbackMessage,
    thinkingMessage,
  } = useQuizLogic(router);

  const [popupTable, setPopupTable] = useState(false);
  const playerNames = useSelector(playerNamesArray);

  const toggleModal = () => {
    setPopupTable(!popupTable);
  };

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const startPulsing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startPulsing();
  }, []);

  return (
    <>
     
      { isPopUp && (
        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={chorPoliceQuizstyles.imageBackground}
          resizeMode="cover"
        >
          <DynamicOverlayPopUp
            isPopUp={isPopUp}
            mediaId={mediaId}
            mediaType={mediaType}
            closeVisibleDelay={3000}
            playerData={{
              image: currentPlayerImage,
              message: feedbackMessage,
              imageType: currentPlayerImageType,
            }}
          />
        </ImageBackground>
      )}
      {!isPopUp && (
        <SafeAreaView style={globalstyles.container}>
         

          <View style={[globalstyles.Container2, { flex: 10 }]}>
            <View style={chorPoliceQuizstyles.overlay} />
            <ImageBackground
              source={require("../../assets/images/bg/quiz.png")}
              style={chorPoliceQuizstyles.imageBackground}
              resizeMode="cover"
            >
              <View style={chorPoliceQuizstyles.quizContainer}>
                <PlayerInfo playerImage={playerImage} />

                <QuizOptions
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