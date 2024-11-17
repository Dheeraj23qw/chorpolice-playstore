import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, ImageBackground, Animated } from "react-native";
import { globalstyles } from "@/styles/global";
import { chorPoliceQuizstyles } from "./quizStyle";
import { useRouter } from "expo-router";
import { Components } from "@/imports/allComponentImports";
import useQuizLogic from "@/hooks/useQuizLogic";
import { responsiveHeight } from "react-native-responsive-dimensions";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { Ionicons } from "@expo/vector-icons";
import ScoreTable from "@/modal/ShowTableModal";
import { RootState } from "@/redux/store";
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";
import {
  playerNamesArray,
  PlayerScoresArray,
} from "@/redux/selectors/playerDataSelector"; // Adjust the import path as necessary
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
  } = useQuizLogic(router);

  const [popupTable, setPopupTable] = useState(false);
  const playerNames = useSelector(playerNamesArray);
  // const playerScores = useSelector(PlayerScoresArray); total points of each player

  const [status, setStatus] = useState<"win" | "lose" | "thinking">("thinking");
  const [thinkingMsg, setThinkingMsg] = useState<string | null>(null);

  const playerScores = useSelector(
    (state: RootState) => state.player.playerScoresByRound
  );

  const toggleModal = () => {
    setPopupTable(!popupTable);
  };

  const randomMessage = useRandomMessage(currentPlayerName, status);

  useEffect(() => {
    // Only set the thinking message if policeIndex is valid and bot is thinking
    if (status === "thinking") {
      setThinkingMsg(randomMessage); // Update the message when the bot is thinking
    }
  }, [status, randomMessage]);
  // Animated value for pulsating effect
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Function to start the pulsating animation
  const startPulsing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2, // Scale up
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Scale down to original size
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startPulsing(); // Start the animation when component mounts
  }, []);

  return (
    <>
      <ScoreTable
        playerNames={playerNames}
        playerScores={playerScores}
        popupTable={popupTable} // Control modal visibility
      />

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
              message: thinkingMsg,
            }}
          />
        </ImageBackground>
      )}
      {isPopUp ? (
        // Show only the background and popup when isPopUp is true
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
        // Show quiz content when isPopUp is false
        <SafeAreaView style={globalstyles.container}>
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
              <View style={chorPoliceQuizstyles.overlay} />
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnim }], // Apply the pulsating scale effect
                }}
              >
                <Ionicons
                  name="bulb" // "bulb" represents a light bulb in Ionicons
                  style={chorPoliceQuizstyles.bulbIcon}
                  onPress={toggleModal} // Toggling the modal when the bulb is clicked
                />
              </Animated.View>
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
