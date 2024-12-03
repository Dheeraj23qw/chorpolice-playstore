import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Text,
  View,
  TouchableWithoutFeedback,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { styles } from "@/modal/_styles/showTableCSS";
import { useDispatch, useSelector } from "react-redux";
import { playSound } from "@/redux/reducers/soundReducer";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons"; // Import Expo vector icons

// Define types as previously defined...
type PlayerScore = {
  scores: (number | string)[];
};

type ScoreItem = {
  round: number;
  scores: (number | string)[];
};

export interface ScoreTableProps {
  playerNames: string[];
  playerScores: PlayerScore[];
  popupTable?: boolean;
}

const ScoreTable: React.FC<ScoreTableProps> = ({
  playerNames,
  playerScores,
  popupTable = false,
}) => {
  const selectedRounds = useSelector(
    (state: RootState) => state.player.gameRound
  );
  const [isModalVisible, setIsModalVisible] = useState(popupTable);
  const maxRounds = selectedRounds;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(playSound("select"));
    setIsModalVisible(popupTable);
  }, [popupTable, dispatch]);

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const renderScoreRow = useCallback(({ item }: { item: ScoreItem }) => {
    return (
      <View style={styles.tableRow}>
        {item.scores.map((score, scoreIndex) => (
          <View
            key={`cell-${scoreIndex}-${item.round}`}
            style={styles.tableCell}
          >
            <Text style={styles.cellText}>{score}</Text>
          </View>
        ))}
      </View>
    );
  }, []);

  const scoreData: ScoreItem[] = Array.from(
    { length: maxRounds },
    (_, rowIndex) => ({
      round: rowIndex,
      scores: playerScores.map((player) =>
        player.scores[rowIndex] !== undefined ? player.scores[rowIndex] : "-"
      ),
    })
  );

  return (
    <View>
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
      <StatusBar backgroundColor={"transparent"} />

        <TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <Text style={styles.heading}>Scoreboard</Text>

            {/* Header row */}
            <View style={styles.tableRow}>
              {playerNames.map((name, index) => (
                <View key={`header-${index}`} style={styles.tableCellHeader}>
                  <Text style={styles.cellTextHeader}>{name}</Text>
                </View>
              ))}
            </View>

            <FlatList
              data={scoreData}
              renderItem={renderScoreRow}
              keyExtractor={(item) => item.round.toString()}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true} // Enable nested scrolling
            />

        
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleModalClose} // Close the table
              accessibilityLabel="Close the table"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ScoreTable;
