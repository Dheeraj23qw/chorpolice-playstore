import React, { memo, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, Animated } from 'react-native';
import { playerNameStyles } from '@/screens/playerNameScreen/playerNameCss';

interface ActionButtonsProps {
  handleStartAdventure?: () => void;
  disabled?: boolean;
}

const PlayernameActionButtonsComponent: React.FC<ActionButtonsProps> = ({ handleStartAdventure, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current; // Initial scale of 1

  useEffect(() => {
    if (!disabled) {
      // Only animate when the button is enabled
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1, // Scale up slightly
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1, // Return to original size
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      // Stop animation if disabled
      scaleAnim.setValue(1);
    }
  }, [disabled, scaleAnim]);

  return (
    <View style={playerNameStyles.infoButtonContainer}>
      {handleStartAdventure && (
        <TouchableOpacity
          style={[
            playerNameStyles.startGameButton,
            disabled && { opacity: 0.5 }, // Reduce opacity when disabled
          ]}
          onPress={handleStartAdventure}
          disabled={disabled}
        >
          <Animated.Text
            style={[
              playerNameStyles.startGameButtonText,
              { transform: [{ scale: scaleAnim }] }, // Apply scale animation
            ]}
          >
            Start Adventure 🚀
          </Animated.Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const PlayernameActionButtons = memo(PlayernameActionButtonsComponent);
