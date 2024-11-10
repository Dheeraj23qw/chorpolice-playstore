import React, { useEffect, useRef } from "react";
import { View, Image, Text, Animated, Easing } from "react-native";
import { ChorPoloceLeaderboardStyles } from "@/screens/ResultScreen/leaderboardStyle";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface PlayerScore {
  playerName: string;
  totalScore: number;
}

interface LeaderboardProps {
  sortedScores: PlayerScore[];
  playerNames: { name: string }[];
  selectedImages: number[];
}

const PlayerItem: React.FC<{
  player: PlayerScore;
  playerIndex: number;
  playerNames: { name: string }[];
}> = ({ player, playerIndex, playerNames }) => {
  const playerImages = useSelector((state: RootState) => state.playerImages.images); // Adjust the path according to your state shape
  const playerImage = playerImages[playerIndex].src;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade-in effect
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Scale-up effect for the image and text
  const slideAnim = useRef(new Animated.Value(-50)).current; // Slide-in effect from the left

  // Run the animations when the component is mounted
  useEffect(() => {
    // Start animations for each player item with a slight delay
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
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
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim }, { scale: scaleAnim }], // Slide and scale
        opacity: fadeAnim, // Fade-in effect
      }}
    >
      <View style={ChorPoloceLeaderboardStyles.playerContainer}>
        <Image
          source={
            typeof playerImage === "string" ? { uri: playerImage } : playerImage
          }
          style={ChorPoloceLeaderboardStyles.playerImage}
          accessibilityLabel={`Image of ${player.playerName}`}
        />
        <Text style={ChorPoloceLeaderboardStyles.playerName}>
          {player.playerName || "Unknown Player"}
        </Text>
        <Text style={ChorPoloceLeaderboardStyles.playerScore}>
          Score: {player.totalScore ?? 0}
        </Text>
      </View>
    </Animated.View>
  );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({
  sortedScores,
  playerNames,
  selectedImages,
}) => {
  // Create a map for quick lookups of player names to indices
  const playerNameToIndexMap = new Map(
    playerNames.map((p, index) => [p.name, selectedImages[index]])
  );

  return (
    <View>
      <Text style={ChorPoloceLeaderboardStyles.leaderboardHeading}>
        Leaderboard
      </Text>
      <View style={ChorPoloceLeaderboardStyles.rankContainer}>
        {sortedScores.map((player, index) => {
          // Get player index using the map, fallback to 0 if not found
          const playerIndex = playerNameToIndexMap.get(player.playerName) ?? 0;

          return (
            <PlayerItem
              key={player.playerName}
              player={player}
              playerIndex={playerIndex}
              playerNames={playerNames}
            />
          );
        })}
      </View>
    </View>
  );
};
