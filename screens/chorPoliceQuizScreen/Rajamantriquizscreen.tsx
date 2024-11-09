import React, { useState } from "react";
import { SafeAreaView, View, ImageBackground } from "react-native";
import { globalstyles } from "@/styles/global";
import { chorPoliceQuizstyles } from "./quizStyle";
import { useRouter } from "expo-router";
import { Components } from "@/imports/allComponentImports";
import useQuizLogic from "@/hooks/useQuizLogic";
import { responsiveHeight } from "react-native-responsive-dimensions";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { Ionicons } from "@expo/vector-icons";
import ScoreTable from "@/modal/ShowTableModal";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";
import { selectPlayerNames } from "@/redux/slices/selectors";
import { playerNamesArray, PlayerScoresArray } from "@/redux/slices/selectors"; // Adjust the import path as necessary

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
  } = useQuizLogic(router);

  const [popupTable, setPopupTable] = useState(false);
  const playerNames = useSelector(playerNamesArray);
  const playerScores = useSelector(PlayerScoresArray);


  const toggleModal = () => {
    setPopupTable(!popupTable);
  };
  return (
    <>
      <ScoreTable
        playerNames={playerNames}
        playerScores={playerScores}
        popupTable={popupTable} // Control modal visibility
      />
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
              <Ionicons
                name="bulb" // "bulb" represents a light bulb in Ionicons
                style={chorPoliceQuizstyles.bulbIcon}
                onPress={toggleModal} // Toggling the modal when the bulb is clicked
              />
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
