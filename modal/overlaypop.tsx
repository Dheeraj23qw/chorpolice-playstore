import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  StatusBar,
} from "react-native";
import { styles } from "@/modal/_styles/overlaypopCSS";
import { data } from "@/constants/popupData";
import { useSelector } from "react-redux";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";
import { OverlayPopUpProps } from "@/types/models/OverlayPop";

const OverlayPopUp: React.FC<OverlayPopUpProps> = ({
  index,
  policeIndex,
  advisorIndex,
  thiefIndex,
  kingIndex,
  displayDuration = 2000, // Default to 2 seconds if not provided
  contentType = "default", // Default content type
  customMessage,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    message: string;
    point: string | null;
    image: any;
    roleMessage: string;
  } | null>(null);
  const [showTapToClose, setShowTapToClose] = useState(false);

  const scaleAnim = useState(new Animated.Value(0))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  const tapToCloseAnim = useState(new Animated.Value(0))[0]; // For "Tap to close" opacity

  const playerNames = useSelector(selectPlayerNames).map(
    (player) => player.name
  );

  const kingName = kingIndex !== null ? playerNames[kingIndex] : "King";
  const policeName = policeIndex !== null ? playerNames[policeIndex] : "Police";
  const advisorName =
    advisorIndex !== null ? playerNames[advisorIndex] : "Advisor";
  const thiefName = thiefIndex !== null ? playerNames[thiefIndex] : "Thief";

  useEffect(() => {
    // Initialize animations and reset tap-to-close visibility
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    tapToCloseAnim.setValue(0); // Reset "Tap to close" opacity
    setShowTapToClose(false);

    if (index >= 1 && index <= data.length) {
      const selectedItem = data[index - 1];
      let roleMessage = "";
      switch (index) {
        case 1:
          roleMessage = `Congratulations ${kingName},\n\n you are the King! 👑`;
          break;
        case 2:
          roleMessage = `${policeName}, you are the Police!🚔 \n\n Catch the Thief`;
          break;
        case 3:
          roleMessage = `Congratulations ${thiefName} 🎉,\n\n lucky escape!`;
          break;
        case 4:
          roleMessage = `🚔 Well done, ${policeName}! 🎉,\n\n you’re the hero! `;
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

      // Start entry animations
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Set a timer to show "Tap to close" after the display duration
      const showTapTimer = setTimeout(() => {
        setShowTapToClose(true);
        // Animate "Tap to close" text visibility
        Animated.timing(tapToCloseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, displayDuration);

      // Set a timer to close the popup automatically after the display duration + buffer time
      const closeTimer = setTimeout(() => {
        closeModal();
      }, displayDuration + 1000); // Add buffer time for "Tap to close" message visibility

      return () => {
        clearTimeout(showTapTimer);
        clearTimeout(closeTimer);
      };
    } else {
      setModalVisible(false);
    }
  }, [index, displayDuration]);

  // Function to close the modal after the timer expires
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

  // Handle screen tap to close modal after timeout
  const handleScreenTap = () => {
    if (showTapToClose) {
      closeModal();
    }
  };

  if (!modalData) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
                <StatusBar backgroundColor={"#000000CC"} />

      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            {contentType === "textOnly" ? (
              // Render text-only content
              <Text style={styles.message}> {customMessage}</Text>
            ) : (
              // Render full content (default)
              <>
                <Text style={styles.message}>{modalData.message}</Text>
                <Text style={styles.roleMessage}>{modalData.roleMessage}</Text>
                <Image
                  source={modalData.image}
                  style={styles.image}
                  resizeMode="contain"
                />
                {modalData.point && (
                  <Text style={styles.point}>{modalData.point}</Text>
                )}
              </>
            )}

            {showTapToClose && (
              <Animated.View style={{ opacity: tapToCloseAnim }}>
                <Text style={styles.tapToClose}>Tap to close</Text>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default OverlayPopUp;
