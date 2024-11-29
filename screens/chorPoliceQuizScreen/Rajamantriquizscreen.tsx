import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  ImageBackground,
  Animated,
  StatusBar,
} from "react-native";
import { globalstyles } from "@/styles/global";
import { chorPoliceQuizstyles } from "./quizStyle";
import { useRouter } from "expo-router";
import { Components } from "@/imports/allComponentImports";
import useQuizLogic from "@/hooks/useQuizLogic";
import { responsiveHeight } from "react-native-responsive-dimensions";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { RootState } from "@/redux/store";
import { playerNamesArray } from "@/redux/selectors/playerDataSelector";
import { useSelector } from "react-redux";
import useRandomMessage from "@/hooks/useRandomMessage";
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
    isBotThinking,
    thinkingMessage,
  } = useQuizLogic(router);

  const [popupTable, setPopupTable] = useState(false);
  const playerNames = useSelector(playerNamesArray);

  const [status, setStatus] = useState<"win" | "lose" | "thinking">("thinking");

  const playerScores = useSelector(
    (state: RootState) => state.player.playerScoresByRound
  );

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
      {isBotThinking && (
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
              image: currentPlayerImage,
              imageType: currentPlayerImageType,
              message: thinkingMessage,
            }}
          />
        </ImageBackground>
      )}
      {isPopUp ? (
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
      ) : (
        <SafeAreaView style={globalstyles.container}>
          <StatusBar backgroundColor={"transparent"} />
          <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
            <Components.ScreenHeader
              name="Boost Your Score!"
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
              {/* <View style={chorPoliceQuizstyles.overlay} /> */}

              <View style={chorPoliceQuizstyles.quizContainer}>
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
