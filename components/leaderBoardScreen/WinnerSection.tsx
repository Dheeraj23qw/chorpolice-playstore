import React, { useMemo } from "react";
import { View, Image, Text } from "react-native";
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
      return image ? image.src : playerImages[0].src; // Fallback to default image if not found
    }

    return playerImages[0].src; // Fallback to default image if index is invalid
  }, [winner.playerName, selectedImages, playerNames]);

  return (
    <View style={ChorPoloceLeaderboardStyles.winnerContainer}>
      <Image
        source={
          typeof winnerImage === "string" ? { uri: winnerImage } : winnerImage
        } // Ensure the source is an object with uri
        style={ChorPoloceLeaderboardStyles.winnerImage}
        accessibilityLabel={`Image of ${winnerName}`}
      />
      <Text style={ChorPoloceLeaderboardStyles.congratulations}>
        🎉 Congratulations!{" "}
      </Text>
      <Text style={ChorPoloceLeaderboardStyles.winnerName}>{winnerName}</Text>
      <Text style={ChorPoloceLeaderboardStyles.winnerScore}>
        Score: {winner.totalScore}
      </Text>
    </View>
  );
};
