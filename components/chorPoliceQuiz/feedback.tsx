import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
} from "react-native";
import { chorPoliceQuizstyles } from "@/screens/chorPoliceQuizScreen/quizStyle";

interface FeedbackModalProps {
  feedbackMessage: string;
  isCorrect: boolean;
  visible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  feedbackMessage,
  isCorrect,
  visible,
  onClose,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [showCloseMessage, setShowCloseMessage] = useState(false);
  const [canClose, setCanClose] = useState(false);

  const imageSource = isCorrect
    ? require("../../assets/gif/quiz/laugh.gif")
    : require("../../assets/gif/quiz/weep.gif");

  useEffect(() => {
    let closeMessageTimeout: NodeJS.Timeout;

    if (visible) {
      // Start animation when modal becomes visible
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Show "Tap to close" message and allow closing after 5 seconds
      closeMessageTimeout = setTimeout(() => {
        setShowCloseMessage(true);
        setCanClose(true);
      }, 5000);
    } else {
      // Reset animation and states when modal is hidden
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      setShowCloseMessage(false);
      setCanClose(false);
    }

    return () => clearTimeout(closeMessageTimeout); // Cleanup on unmount
  }, [visible]);

  const handleCloseModal = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            <Image
              source={imageSource}
              style={styles.feedbackIcon}
              accessibilityLabel={
                isCorrect ? "Correct answer GIF" : "Wrong answer GIF"
              }
            />
            <Text style={styles.feedbackMessage}>
              {feedbackMessage}
            </Text>
            {/* "Tap to close" message after 5 seconds */}
            {showCloseMessage && (
              <Text style={styles.tapToCloseText}>Tap to close</Text>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 250,
    height: 250,
  },
  feedbackIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  feedbackMessage: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
  },
  tapToCloseText: {
    marginTop: 15,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default FeedbackModal;
