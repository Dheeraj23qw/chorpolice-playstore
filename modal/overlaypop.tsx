import React, { useEffect, useState } from "react";
import { View, Text, Image, Modal, StyleSheet } from "react-native";
import { responsiveHeight, responsiveFontSize } from "react-native-responsive-dimensions";
import { data, DataItem } from "@/constants/popupData";

interface OverlayPopUpProps
 {
  index: number;
}

const OverlayPopUp: React.FC<OverlayPopUpProps> = ({ index }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<DataItem | null>(null);
  const [randomMessage, setRandomMessage] = useState<string>("");

  useEffect(() => {
    if (index >= 1 && index <= data.length) {
      const selectedItem = data[index - 1]; // get the selected data item
      setSelectedData(selectedItem);
      setRandomMessage(selectRandomMessage(selectedItem.message1)); // set a random message from message1
      setModalVisible(true);

      const timer = setTimeout(() => {
        setModalVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [index]);

  // Function to select a random message
  const selectRandomMessage = (messages: string[]): string => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  if (!selectedData) return null;

  return (
    <Modal visible={modalVisible} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.message}>{selectedData.message}</Text>
          {selectedData.point ? (
            <Text style={styles.point}>{selectedData.point}</Text>
          ) : null}
          <Image source={selectedData.image} style={styles.image} resizeMode="contain" />

          <Text style={styles.randomMessage}>{randomMessage}</Text> 
        </View>
      </View>
    </Modal>
  );
};

export default OverlayPopUp;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "90%",
    padding: responsiveHeight(2),
    borderRadius: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: responsiveHeight(40),
    marginBottom: responsiveHeight(1.5),
  },
  message: {
    fontSize: responsiveFontSize(2.2),
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: responsiveHeight(1),
  },
  randomMessage: {
    fontSize: responsiveFontSize(2),
    color: "#fff",
    textAlign: "center",
    marginVertical: responsiveHeight(1),
  },
  point: {
    fontSize: responsiveFontSize(2.5),  // Slightly larger font for emphasis
    color: "#FFD700",  // Gold color for highlighting the points
    textAlign: "center",
    fontWeight: "bold", // Make the points bold for better emphasis
    marginVertical: responsiveHeight(1),
    padding: responsiveHeight(1), // Add some padding for better spacing
    backgroundColor: "#000", // Add a dark background for contrast
    borderRadius: 10, // Round the edges for a clean look
    shadowColor: "#fff", // Light shadow to make it pop
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
});
