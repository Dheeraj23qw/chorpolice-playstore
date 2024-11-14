import React, { useState, useEffect } from "react";
import { Modal, Text, View, TouchableWithoutFeedback } from "react-native";
import { styles } from "@/modal/_styles/showTableCSS";
import { useDispatch } from "react-redux";
import { playSound } from "@/redux/reducers/soundReducer";
import { ScoreTableProps } from "@/types/models/ScoreTableModal";

const ScoreTable: React.FC<ScoreTableProps> = ({
  playerNames,
  playerScores,
  popupTable = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(popupTable);
  const maxRounds = 7;
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
        <TouchableWithoutFeedback onPress={handleModalClose}>
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
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ScoreTable;
