import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { styles } from "@/modal/_styles/overlaypopCSS";
import { data } from "@/constants/popupData";
import { useSelector } from "react-redux";
import { selectPlayerNames } from "@/redux/slices/selectors";

interface OverlayPopUpProps {
  index: number;
  policeIndex: number | null;
  advisorIndex: number | null;
  thiefIndex: number | null;
  kingIndex: number | null;
}

const OverlayPopUp: React.FC<OverlayPopUpProps> = ({
  index,
  policeIndex,
  advisorIndex,
  thiefIndex,
  kingIndex,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    message: string;
    point: string | null;
    image: any;
    roleMessage: string;
  } | null>(null);
  const [showCloseButton, setShowCloseButton] = useState(false); // State to control close button visibility
  const [canClose, setCanClose] = useState(false); // State to control if the modal can be closed

  // Animated values for zoom-in effect
  const scaleAnim = useState(new Animated.Value(0))[0]; // Start from 0 scale
  const opacityAnim = useState(new Animated.Value(0))[0]; // Start from invisible

  const playerNames = useSelector(selectPlayerNames).map(
    (player) => player.name
  );

  // Get names based on the provided indexes
  const kingName = kingIndex !== null ? playerNames[kingIndex] : "King";
  const policeName = policeIndex !== null ? playerNames[policeIndex] : "Police";
  const advisorName = advisorIndex !== null ? playerNames[advisorIndex] : "Advisor";
  const thiefName = thiefIndex !== null ? playerNames[thiefIndex] : "Thief";

  useEffect(() => {
    // Reset animation state each time the index changes
    scaleAnim.setValue(0); // Reset scale to 0
    opacityAnim.setValue(0); // Reset opacity to 0
    setShowCloseButton(false); // Hide close button initially when index changes
    setCanClose(false); // Prevent closing the modal before 5 seconds

    // Clear any existing timeout to prevent multiple timers
    const timeout = setTimeout(() => {
      setShowCloseButton(true); // Show the "Tap to close" button after 5 seconds
      setCanClose(true); // Allow the modal to be closed
    }, 5000);

    if (index >= 1 && index <= data.length) {
      const selectedItem = data[index - 1];

      // Set the role-specific message based on the index
      let roleMessage = "";
      switch (index) {
        case 1:
          roleMessage = `Congratulations ${kingName},\n\n  you are the King! 👑`;
          break;
        case 2:
          roleMessage = `${policeName}, you are the Police!🚔 \n\n Catch the Thief`;
          break;
        case 3:
          roleMessage = `Congratulations ${advisorName} 🎉,\n\n  you are the Advisor! 🧠`;
          break;
        case 4:
          roleMessage = `Congratulations ${thiefName}  🎉,\n\n lucky escape!`;
          break;
        case 5:
          roleMessage = `🚔 Well done, ${policeName}! 🎉,\n\n  you’re the hero! `;
          break;
        default:
          roleMessage = "";
      }

      setModalData({
        message: selectedItem.message,
        point: selectedItem.point || null,
        image: selectedItem.image,
        roleMessage: roleMessage,
      });

      setModalVisible(true);

      // Trigger zoom-in animation when modal is shown after index change
      Animated.timing(scaleAnim, {
        toValue: 1, // Scale to normal size
        duration: 900, // Duration of zoom effect
        useNativeDriver: true,
      }).start();

      Animated.timing(opacityAnim, {
        toValue: 1, // Fade-in effect
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else {
      setModalVisible(false);
    }

    // Clear timeout when index changes to avoid multiple timeouts
    return () => clearTimeout(timeout);
  }, [index]); // Trigger animation when index changes

  // Function to handle closing the modal
  const handleCloseModal = () => {
    if (canClose) {
      setModalVisible(false); // Close the modal if canClose is true
    }
  };

  if (!modalData) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim, // Apply fade-in effect
              },
            ]}
          >
            <Text style={styles.message}>{modalData.message}</Text>

            {/* New section to show the role-specific message */}
            <Text style={styles.roleMessage}>{modalData.roleMessage}</Text>

            <Image
              source={modalData.image}
              style={styles.image}
              resizeMode="contain"
            />
            {modalData.point && <Text style={styles.point}>{modalData.point}</Text>}

            {/* Show "Tap to close" button after 5 seconds */}
            {showCloseButton && <Text style={styles.tapToClose}>Tap to close</Text>}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default OverlayPopUp;
