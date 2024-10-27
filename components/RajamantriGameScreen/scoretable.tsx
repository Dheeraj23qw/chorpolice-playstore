import React, { memo } from "react";
import { Text, View } from "react-native";
import { styles } from "@/screens/RajaMantriGameScreen/styles";

interface ScoreTableProps {
  playerNames: string[];
  playerScores: Array<{ playerName: string; scores: number[] }>;
}

const ScoreTable: React.FC<ScoreTableProps> = ({ playerNames, playerScores }) => {
  const maxRounds = 7;

  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={styles.tableRow}>
        {playerNames.map((name, index) => (
          <View key={`header-${index}`} style={styles.tableCell}>
            <Text style={styles.cellText}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Data rows for rounds and scores */}
      {Array.from({ length: maxRounds }, (_, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.tableRow}>
          {playerScores.map((player, index) => (
            <View key={`cell-${index}-${rowIndex}`} style={styles.tableCell}>
              <Text style={styles.cellText}>
                {player.scores[rowIndex] !== undefined ? player.scores[rowIndex] : '-'}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default memo(ScoreTable);
