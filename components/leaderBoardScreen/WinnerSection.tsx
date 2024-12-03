import React, { useMemo, useEffect, useRef } from "react";
import { View, Image, Text, Animated, Easing } from "react-native";
import { ChorPoloceLeaderboardStyles } from "@/screens/ResultScreen/leaderboardStyle";

interface WinnerSectionProps {
  winnerName: any;
  winnerImage: any;
  winner: any;
}

export const WinnerSection: React.FC<WinnerSectionProps> = ({
  winnerName,
  winnerImage,
  winner,
}) => {
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
          source={
            typeof winnerImage === "string" ? { uri: winnerImage } : winnerImage
          } // Ensure the source is an object with uri
          style={ChorPoloceLeaderboardStyles.winnerImage}
          accessibilityLabel={`Image of ${winnerName}`}
        />
      </Animated.View>

      <Animated.Text
        style={[
          ChorPoloceLeaderboardStyles.congratulations,
          { opacity: fadeAnim },
        ]} // Fade-in effect for the text
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
        you have won 1000 coins
      </Animated.Text>
    </View>
  );
};