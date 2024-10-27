import React from 'react';
import { View, Image, Text } from 'react-native';
import { ChorPoloceLeaderboardStyles } from '@/screens/ResultScreen/leaderboardStyle';
import { playerImages } from '@/constants/playerData';

interface LeaderboardProps {
  sortedScores: { playerName: string; totalScore: number }[];
  playerNames: { name: string }[];
  selectedImages: number[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ sortedScores, playerNames, selectedImages }) => {
  // Create a map for quick lookups
  const playerNameToIndexMap = new Map(playerNames.map((p, index) => [p.name, index]));

  return (
    <View>
      <Text style={ChorPoloceLeaderboardStyles.leaderboardHeading}>Leaderboard</Text>
      <View style={ChorPoloceLeaderboardStyles.rankContainer}>
        {sortedScores.map((player) => {
          // Find player index using the map
          const playerIndex = playerNameToIndexMap.get(player.playerName);
          const playerImage = playerIndex !== undefined
            ? playerImages[selectedImages[playerIndex]] ?? playerImages[0] // Fallback to default image
            : playerImages[0]; // Fallback to default image if index not found
          
          return (
            <View key={player.playerName} style={ChorPoloceLeaderboardStyles.playerContainer}>
              <Image
                source={playerImage}
                style={ChorPoloceLeaderboardStyles.playerImage}
                accessibilityLabel={`Image of ${player.playerName}`}
              />
              <Text style={ChorPoloceLeaderboardStyles.playerName}>{player.playerName || 'Unknown Player'}</Text>
              <Text style={ChorPoloceLeaderboardStyles.playerScore}>Score: {player.totalScore ?? 0}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
