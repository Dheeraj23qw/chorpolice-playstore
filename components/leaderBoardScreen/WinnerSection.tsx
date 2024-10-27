import React, { useMemo } from 'react';
import { View, Image, Text } from 'react-native';
import { ChorPoloceLeaderboardStyles } from '@/screens/ResultScreen/leaderboardStyle';
import { playerImages } from '@/constants/playerData';

interface WinnerSectionProps {
  sortedScores: { playerName: string; totalScore: number }[];
  playerNames: { name: string }[];
  selectedImages: number[];
}

export const WinnerSection: React.FC<WinnerSectionProps> = ({ sortedScores, playerNames, selectedImages }) => {
  // Determine the top winner
  const winner = sortedScores[0] ?? { playerName: '', totalScore: 0 };

  // Memoize the winner's name for performance optimization
  const winnerName = useMemo(() => {
    return playerNames.find(player => player.name === winner.playerName)?.name || 'Unknown Player';
  }, [winner.playerName, playerNames]);

  // Memoize the winner's image based on their index
  const winnerImage = useMemo(() => {
    const winnerIndex = playerNames.findIndex(player => player.name === winner.playerName);
    // Ensure the selectedImages array has valid indexes
    return playerImages[selectedImages[winnerIndex] || 0] ?? playerImages[0];
  }, [winner.playerName, selectedImages, playerNames]);

  return (
    <View style={ChorPoloceLeaderboardStyles.winnerContainer}>
      <Image
        source={winnerImage}
        style={ChorPoloceLeaderboardStyles.winnerImage}
        accessibilityLabel={`Image of ${winnerName}`}
      />
      <Text style={ChorPoloceLeaderboardStyles.congratulations}>🎉 Congratulations! </Text>
      <Text style={ChorPoloceLeaderboardStyles.winnerName}>{winnerName}</Text>
      <Text style={ChorPoloceLeaderboardStyles.winnerScore}>Score: {winner.totalScore}</Text>
    </View>
  );
};
