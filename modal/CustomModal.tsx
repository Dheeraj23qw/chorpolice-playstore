import React, { useCallback, useEffect, useRef, memo } from 'react';
import { Modal, Text, Pressable, View, Animated, StatusBar } from 'react-native';
import { playerNameStyles } from '@/screens/playerNameScreen/playerNameCss';
import { CustomModalProps } from '@/types/models/CustomModal';
import {styles} from "@/modal/_styles/customModalStyles"

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  content,
  buttons,
  children,  // Include children if needed for flexible content
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale value
  const opacityAnim = useRef(new Animated.Value(0)).current; // Initial opacity value

  useEffect(() => {
    const animationConfig = {
      useNativeDriver: true,
    };

    if (visible) {
      // Start animation when modal is visible
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3, 
          tension: 100, 
          ...animationConfig,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500, 
          ...animationConfig,
        }),
      ]).start();
    } else {
      // Reset animation when modal is not visible
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300, 
          ...animationConfig,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          ...animationConfig,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleButtonPress = useCallback((onPress: () => void) => {
    onPress();
    onClose(); // Close the modal when a button is pressed
  }, [onClose]);

  const renderButtons = useCallback(() => (
    buttons.map((button, index) => (
      <Pressable
        key={index}
        style={styles.modalButton}
        onPress={() => handleButtonPress(button.onPress)}
        accessibilityLabel={button.text}
      >
        <Text style={styles.modalButtonText}>{button.text}</Text>
      </Pressable>
    ))
  ), [buttons, handleButtonPress]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
                <StatusBar backgroundColor={"#000000CC"} />

      <View style={styles.modalContainer}>
        <Animated.View style={[
          styles.modalContent,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}>
          <Text style={styles.modaltitle}>{title}</Text>
          <Text style={styles.modalText}>{content}</Text>
          
          {/* Render children passed to the modal */}
          {children && <View>{children}</View>}
          
          <View style={styles.buttonRow}>
            {renderButtons()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(CustomModal);
