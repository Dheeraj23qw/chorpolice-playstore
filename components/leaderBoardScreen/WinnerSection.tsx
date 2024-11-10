import React, { useMemo, useEffect, useRef } from "react";
import { View, Image, Text, Animated, Easing } from "react-native";
import { ChorPoloceLeaderboardStyles } from "@/screens/ResultScreen/leaderboardStyle";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface WinnerSectionProps {
  sortedScores: { playerName: string; totalScore: number }[];
  playerNames: { name: string }[];
  selectedImages: number[];
}

export const WinnerSection: React.FC<WinnerSectionProps> = ({
  sortedScores,
  playerNames,
  selectedImages,
}) => {
  // Determine the top winner
  const winner = sortedScores[0] ?? { playerName: "", totalScore: 0 };
  const playerImages = useSelector((state: RootState) => state.playerImages.images); // Adjust the path according to your state shape

  // Define a fallback image source
  const fallbackImage = require('@/assets/images/chorsipahi/kid2.png'); // Update this path to your fallback image

  // Memoize the winner's name for performance optimization
  const winnerName = useMemo(() => {
    return (
      playerNames.find((player) => player.name === winner.playerName)?.name ||
      "Unknown Player"
    );
  }, [winner.playerName, playerNames]);

  // Memoize the winner's image based on their index
  const winnerImage = useMemo(() => {
    const winnerIndex = playerNames.findIndex(
      (player) => player.name === winner.playerName
    );

    // Ensure the selectedImages array has valid indexes
    if (winnerIndex >= 0 && winnerIndex < selectedImages.length) {
      const image = playerImages[selectedImages[winnerIndex]];
      return image && image.src ? image.src : fallbackImage; // Use fallback image if not found
    }

    return fallbackImage; // Fallback to default image if index is invalid
  }, [winner.playerName, selectedImages, playerNames, playerImages]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade-in effect
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Scale-up effect for the image and text
  const bounceAnim = useRef(new Animated.Value(0)).current; // Bounce effect for the image

  // Run the animations when the component is mounted
  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={ChorPoloceLeaderboardStyles.winnerContainer}>
      <Animated.View
        style={{
          opacity: fadeAnim, // Apply fade-in effect
          transform: [
            { scale: scaleAnim }, // Apply scale-up effect
            { scale: bounceAnim }, // Apply bounce effect
          ],
        }}
      >
        <Image
          source={typeof winnerImage === "string" ? { uri: winnerImage } : winnerImage} // Ensure the source is an object with uri
          style={ChorPoloceLeaderboardStyles.winnerImage}
          accessibilityLabel={`Image of ${winnerName}`}
        />
      </Animated.View>

      <Animated.Text
        style={[ChorPoloceLeaderboardStyles.congratulations, { opacity: fadeAnim }]} // Fade-in effect for the text
      >
        🎉 Congratulations!{" "}
      </Animated.Text>

      <Animated.Text
        style={[ChorPoloceLeaderboardStyles.winnerName, { opacity: fadeAnim }]} // Fade-in effect for the name
      >
        {winnerName}
      </Animated.Text>

      <Animated.Text
        style={[ChorPoloceLeaderboardStyles.winnerScore, { opacity: fadeAnim }]} // Fade-in effect for the score
      >
        Score: {winner.totalScore}
      </Animated.Text>
    </View>
  );
};
