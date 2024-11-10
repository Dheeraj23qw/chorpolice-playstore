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
  const [canClose, setCanClose] = useState(false); // State to control if the modal can be closed

  const scaleAnim = useState(new Animated.Value(0))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  const closeButtonOpacity = useState(new Animated.Value(0))[0];

  const playerNames = useSelector(selectPlayerNames).map(
    (player) => player.name
  );

  const kingName = kingIndex !== null ? playerNames[kingIndex] : "King";
  const policeName = policeIndex !== null ? playerNames[policeIndex] : "Police";
  const advisorName =
    advisorIndex !== null ? playerNames[advisorIndex] : "Advisor";
  const thiefName = thiefIndex !== null ? playerNames[thiefIndex] : "Thief";

  useEffect(() => {
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    closeButtonOpacity.setValue(0); // Reset close button opacity
    setCanClose(false);

    const timeout = setTimeout(() => {
      Animated.timing(closeButtonOpacity, {
        toValue: 1, // Fade-in effect for close button
        duration: 500,
        useNativeDriver: true,
      }).start();
      setCanClose(true);
    }, 3000);

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

      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }).start();

      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else {
      setModalVisible(false);
    }

    return () => clearTimeout(timeout);
  }, [index]);

  const handleCloseModal = () => {
    if (canClose) {
      setModalVisible(false);
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
                opacity: opacityAnim,
              },
            ]}
          >
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

            <Animated.Text
              style={[
                styles.tapToClose,
                { opacity: closeButtonOpacity }, // Control visibility with opacity
              ]}
            >
              Tap to close
            </Animated.Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default OverlayPopUp;
