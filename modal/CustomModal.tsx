import React, { useCallback, useEffect, useRef } from 'react';
import { Modal, Text, Pressable, View, Animated } from 'react-native';
import { playerNameStyles } from '@/screens/playerNameScreen/playerNameCss';

interface CustomModalButtonProps {
  text: string;
  onPress: () => void;
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
  buttons: CustomModalButtonProps[];
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  content,
  buttons
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale value
  const opacityAnim = useRef(new Animated.Value(0)).current; // Initial opacity value

  useEffect(() => {
    if (visible) {
      // Start animation when modal is visible
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3, // Adjusts the bounce effect
          tension: 100, // Adjusts how fast it reaches the final value
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500, // Longer duration for a smoother fade
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation when modal is not visible
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300, // Shorter fade-out duration
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const renderButtons = useCallback(() => (
    buttons.map((button, index) => (
      <Pressable
        key={index}
        style={playerNameStyles.modalButton}
        onPress={() => {
          button.onPress();
          onClose(); // Close the modal when a button is pressed
        }}
        accessibilityLabel={button.text}
      >
        <Text style={playerNameStyles.modalButtonText}>{button.text}</Text>
      </Pressable>
    ))
  ), [buttons, onClose]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={playerNameStyles.modalContainer}>
        <Animated.View style={[
          playerNameStyles.modalContent,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}>
          <Text style={playerNameStyles.modaltitle}>
            {title}
          </Text>
          <Text style={playerNameStyles.modalText}>
            {content}
          </Text>
          <View style={playerNameStyles.buttonRow}>
            {renderButtons()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomModal;
