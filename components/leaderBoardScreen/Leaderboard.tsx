import React from "react";
import { View, Image, Text } from "react-native";
import { ChorPoloceLeaderboardStyles } from "@/screens/ResultScreen/leaderboardStyle";
import { playerImages } from "@/constants/playerData";

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
  const playerImage = playerImages[playerIndex].src;

  return (
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
        {sortedScores.map((player) => {
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
