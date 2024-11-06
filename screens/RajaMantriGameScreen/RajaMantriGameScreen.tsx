import React from "react";
import {
  View,
  ScrollView,
  StatusBar,
  ImageBackground,
  BackHandler,
} from "react-native";

// Redux
import { useSelector } from "react-redux";
import { selectPlayerNames } from "@/redux/slices/selectors";

// Hooks
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";

// Styles
import { styles } from "./styles";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";

// Components
import { Components } from "@/imports/allComponentImports";
import OverlayPopUp from "@/modal/overlaypop";
import useBackHandlerModal from "@/hooks/useBackHandlerModal";
import CustomModal from "@/modal/CustomModal";
const RajaMantriGameScreen: React.FC = () => {
  // Select player names from the Redux store and map to an array
  const playerNames = useSelector(selectPlayerNames).map(
    (player) => player.name
  );

  // Custom hook to manage game state and actions
  const {
    flipAnims, // Animation states for card flipping
    flippedStates, // States to check if cards are flipped
    clickedCards, // Track clicked cards
    message, // Message to display
    roles, // Roles assigned to players
    isPlayButtonDisabled, // Flag to disable play button
    playerScores, // Scores of players
    round, // Current round number
    videoIndex, // Index of the video to play
    isPlaying, // Flag to check if video is playing
    handlePlay, // Function to handle play button press
    setIsPlaying, // Function to set playing state
    handleCardClick, // Function to handle card click
    policeIndex,
    kingIndex,
    advisorIndex,
    thiefIndex,
    popupIndex,
  } = useRajaMantriGame({ playerNames });

  // Use the custom hook to handle back button press and modal
  const { modalVisible, setModalVisible, modalButtons } = useBackHandlerModal({
    onExit: () => {
      // Custom exit logic, e.g., exit the app
      BackHandler.exitApp();
    }
  });

  return (
    <>
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Exit Game"
        content="Do you want to exit the game?"
        buttons={modalButtons}
      />
      {popupIndex && <OverlayPopUp
       index={popupIndex} 
       policeIndex={policeIndex}
       kingIndex={kingIndex}
       advisorIndex={advisorIndex}
       thiefIndex={thiefIndex}
      
      
      />}

      <View style={[styles.container]}>
        {isPlaying ? (
          // Render video player component if video is playing
          <Components.VideoPlayerComponent
            videoIndex={videoIndex}
            onVideoEnd={() => setIsPlaying(false)}
          />
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Background image overlay for the game */}
              <ImageBackground
                source={require("../../assets/images/bg/quiz.png")}
                style={chorPoliceQuizstyles.imageBackground}
                resizeMode="cover"
              >
                <View style={chorPoliceQuizstyles.overlay} />

                {/* Play button for starting the game */}
                <Components.PlayButton
                  disabled={isPlayButtonDisabled}
                  onPress={handlePlay}
                  buttonText={
                    isPlayButtonDisabled
                      ? message
                        ? message
                        : `Round ${round}` // Display round number if button is disabled
                      : `Press me to play!` // Button text when active
                  }
                />

                {/* Render player cards in two rows */}
                <View style={styles.cardRow}>
                  {roles.slice(0, 2).map((_, index) => (
                    <Components.PlayerCard
                      key={index}
                      index={index}
                      role={roles[index]} // Assign role to player card
                      playerName={playerNames[index]} // Fallback player name
                      flipped={flippedStates[index]} // Check if card is flipped
                      clicked={clickedCards[index]} // Check if card is clicked
                      onClick={handleCardClick} // Handle card click
                      roles={roles}
                      policeIndex={policeIndex}
                      kingIndex={kingIndex}
                      advisorIndex={advisorIndex}
                      thiefIndex={thiefIndex}
                      animatedStyle={{
                        transform: [
                          {
                            rotateY: flipAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0deg", "14400deg"], // Flipping animation
                            }),
                          },
                        ],
                      }}
                    />
                  ))}
                </View>
                <View style={styles.cardRow}>
                  {roles.slice(2).map((_, index) => (
                    <Components.PlayerCard
                      key={index + 2}
                      index={index + 2}
                      role={roles[index + 2]} // Assign role to player card
                      playerName={playerNames[index + 2]} // Fallback player name
                      flipped={flippedStates[index + 2]} // Check if card is flipped
                      clicked={clickedCards[index + 2]} // Check if card is clicked
                      onClick={handleCardClick} // Handle card click
                      roles={roles}
                      policeIndex={policeIndex}
                      kingIndex={kingIndex}
                      advisorIndex={advisorIndex}
                      thiefIndex={thiefIndex}
                      animatedStyle={{
                        transform: [
                          {
                            rotateY: flipAnims[index + 2].interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0deg", "14400deg"], // Flipping animation
                            }),
                          },
                        ],
                      }}
                    />
                  ))}
                </View>
              </ImageBackground>

              {/* Score table displaying player scores */}
              <View style={styles.scrollView}>
                <Components.ScoreTable
                  playerNames={playerNames}
                  playerScores={playerScores} // Pass scores to the score table
                />
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
};

export default React.memo(RajaMantriGameScreen);
