import React, { useState, useEffect } from "react";
import {
  Modal,
  Text,
  View,
  TouchableWithoutFeedback,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { styles } from "@/modal/_styles/showTableCSS";
import { useDispatch, useSelector } from "react-redux";
import { playSound } from "@/redux/reducers/soundReducer";
import { ScoreTableProps } from "@/types/models/ScoreTableModal";
import { RootState } from "@/redux/store";

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

  // Use useEffect to open or close the modal when popupTable changes
  useEffect(() => {
    dispatch(playSound("select"));

    setIsModalVisible(popupTable);
  }, [popupTable, dispatch]);

  // Function to handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <View>
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <StatusBar backgroundColor={"#000000CC"} />

        <TouchableWithoutFeedback >
          <View style={styles.modalContainer}>
            {/* Score Table Heading */}
            <Text style={styles.heading}>Scoreboard</Text>

            {/* Header row */}
            <View style={styles.tableRow}>
              {playerNames.map((name, index) => (
                <View key={`header-${index}`} style={styles.tableCellHeader}>
                  <Text style={styles.cellTextHeader}>{name}</Text>
                </View>
              ))}
            </View>
            <ScrollView showsVerticalScrollIndicator={false}  nestedScrollEnabled={true} // Enable nested scrolling
            >
              {/* Data rows for rounds and scores */}
              {Array.from({ length: maxRounds }, (_, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.tableRow}>
                  {playerScores.map((player, index) => (
                    <View
                      key={`cell-${index}-${rowIndex}`}
                      style={styles.tableCell}
                    >
                      <Text style={styles.cellText}>
                        {player.scores[rowIndex] !== undefined
                          ? player.scores[rowIndex]
                          : "-"}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
                <TouchableOpacity
            style={styles.closeButton}
            onPress={handleModalClose} // Close the table
            accessibilityLabel="Close the table"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ScoreTable;
