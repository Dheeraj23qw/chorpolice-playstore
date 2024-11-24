import React, { Dispatch, SetStateAction } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import { styles } from "@/components/thinkAndCountScreen/_styles/GameTableStyles"; // Import styles

// Define props type
interface GameTableProps {
  isTableOpen: boolean;
  setIsTableOpen: Dispatch<SetStateAction<boolean>>;
  table: (string | number)[][];
}

// Annotate the component
const GameTable: React.FC<GameTableProps> = ({
  isTableOpen,
  setIsTableOpen,
  table,
}) => {
  return (
    <>
      <View style={styles.overlay} />

      <Modal
        visible={isTableOpen}
        transparent={true} // Enables overlay effect
        animationType="fade" // Smooth animation
      >
        <ImageBackground
          source={require("../../assets/images/bg/quizbg2.png")} // Background image
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />

          <View style={styles.tableContainer}>
            {/* Header */}
            <Text style={styles.header}>Quiz Table</Text>

            {/* Table Header Row */}
            {table.length > 0 && (
              <View style={[styles.row, styles.headerRow]}>
                {table[0].map((cell, cellIndex) => (
                  <View
                    style={[styles.cell, styles.headerCell]}
                    key={cellIndex}
                  >
                    <Text style={[styles.cellText, styles.headerCellText]}>
                      {cell}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Scrollable Rows */}
            <ScrollView style={styles.scrollableContainer}>
              {table.slice(1).map((row, rowIndex) => (
                <View style={styles.row} key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <View style={styles.cell} key={cellIndex}>
                      <Text style={styles.cellText}>{cell}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsTableOpen(false)} // Close the table
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </Modal>
    </>
  );
};

export default GameTable;
