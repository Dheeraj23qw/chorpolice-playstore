import React, { useMemo } from "react";
// Importing core React and React Native components
import {
  SafeAreaView,
  View,
  ImageBackground,
  StatusBar,
} from "react-native";
import { responsiveHeight } from "react-native-responsive-dimensions";

// styles
import { globalstyles } from "@/styles/global"; // Global styles used across the app
import { chorPoliceQuizstyles } from "./quizStyle"; // Styles specific to the ChorPoliceQuiz component

// Import router from expo-router for navigation
import { useRouter } from "expo-router";

// components
import { Components } from "@/imports/allComponentImports"; // Collectively importing all components for easy access

//custom hook
import useQuizLogic from "@/hooks/useQuizLogic"; // Hook managing quiz state and logic



const ChorPoliceQuiz: React.FC = () => {
  const router = useRouter(); // Initialize router for navigation

  // Destructuring values from custom hook useQuizLogic
  const {
    currentPlayer,    // Current player object
    playerImage,      // Player's image
    feedbackMessage,  // Feedback message for the player
    isCorrect,        // Flag indicating if the answer was correct
    options,          // Available options for the quiz
    isContentVisible, // Flag to control visibility of quiz content
    handleOptionPress,// Function to handle option selection
    isOptionDisabled, // Flag to disable options after selection
  } = useQuizLogic(router); // Using custom hook to manage quiz state and logic

  // Memoize components that don't need to re-render often for performance optimization
  const MemoizedPlayerInfo = useMemo(
    () => <Components.PlayerInfo playerImage={playerImage} />,
    [playerImage] // Only re-render when playerImage changes
  );

  const MemoizedFeedbackMessage = useMemo(
    () => (
      <Components.FeedbackMessage
        feedbackMessage={feedbackMessage}
        isCorrect={isCorrect}
      />
    ),
    [feedbackMessage, isCorrect] // Re-render when feedbackMessage or isCorrect changes
  );

  const MemoizedQuizOptions = useMemo(
    () =>
      isContentVisible && (
        <Components.QuizOptions
          playerName={currentPlayer.name}
          options={options}
          onOptionPress={handleOptionPress}
          isOptionDisabled={isOptionDisabled}
        />
      ),
    [
      isContentVisible,
      currentPlayer.name,
      options,
      handleOptionPress,
      isOptionDisabled,
    ] // Re-render when any of these dependencies change
  );

  return (
    <SafeAreaView style={globalstyles.container}>
      <StatusBar backgroundColor="#8E5DE9" barStyle="dark-content" />
      <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
        {/* Screen header for the quiz */}
        <Components.ScreenHeader name="Quiz Time" showBackButton={false} />
      </View>

      <View style={[globalstyles.Container2, { flex: 10 }]}>
        <View style={chorPoliceQuizstyles.overlay} />

        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={chorPoliceQuizstyles.imageBackground}
          resizeMode="cover"
        >
          {/* Overlay for the background image */}
          <View style={chorPoliceQuizstyles.overlay} />

          <View style={chorPoliceQuizstyles.quizContainer}>
            {MemoizedPlayerInfo}       {/* Display the player's info */}
            {MemoizedFeedbackMessage}   {/* Display feedback message */}
            {MemoizedQuizOptions}       {/* Display quiz options if content is visible */}
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
};

// Memoize the ChorPoliceQuiz component to prevent unnecessary re-renders
export default React.memo(ChorPoliceQuiz);
