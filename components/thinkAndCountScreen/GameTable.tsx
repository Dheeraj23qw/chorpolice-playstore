import React, { Dispatch, SetStateAction, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ImageBackground,
  Platform,
  StatusBar,
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
  const memoizedTable = useMemo(() => table, [table]);

  // Render table header row
  const renderHeader = () => {
    return (
      <View style={[styles.row, styles.headerRow]}>
        {memoizedTable[0].map((cell, cellIndex) => (
          <View style={[styles.cell, styles.headerCell]} key={cellIndex}>
            <Text style={[styles.cellText, styles.headerCellText]}>{cell}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render table row
  const renderRow = ({
    item,
    index,
  }: {
    item: (string | number)[];
    index: number;
  }) => (
    <View style={styles.row} key={index}>
      {item.map((cell, cellIndex) => (
        <View style={styles.cell} key={cellIndex}>
          <Text style={styles.cellText}>{cell}</Text>
        </View>
      ))}
    </View>
  );

  // Close modal handler
  const handleClose = () => setIsTableOpen(false);

  return (
    <Modal
      visible={isTableOpen}
      transparent={true} // Enables overlay effect
      animationType="fade" // Smooth animation
      onRequestClose={handleClose} // Handle back press on Android
    >
      <StatusBar backgroundColor={"#000000CC"} />

      <ImageBackground
        source={require("../../assets/images/bg/quizbg2.png")} // Background image
        style={styles.backgroundImage}
      >
        <View style={styles.overlay} />

        <View style={styles.tableContainer}>
          {/* Header */}
          <Text style={styles.header}>Quiz Table</Text>

          {/* Table Header Row */}
          {memoizedTable.length > 0 && renderHeader()}

          {/* Scrollable Rows */}
          <FlatList
            data={memoizedTable.slice(1)} // Skip the header row
            renderItem={renderRow}
            keyExtractor={(_, index) => index.toString()}
            style={styles.scrollableContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose} // Close the table
            accessibilityLabel="Close the table"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </Modal>
  );
};

export default GameTable;
