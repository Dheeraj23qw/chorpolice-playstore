import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { winnerstyles } from './buttonStyle';

interface ActionButtonsProps {
  handlePlayAgain: () => void;
  handleBack: () => void;
  handleShare: () => void;
  isButtonDisabled: boolean; 
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ handlePlayAgain, handleBack, handleShare,isButtonDisabled }) => {
  return (
    <View style={winnerstyles.buttonContainer}>
      {/* Button to navigate back to the home screen */}
      <Pressable 
        style={winnerstyles.button} 
        onPress={handleBack} 
        accessibilityLabel="Go to Home"
        accessibilityHint="Navigates back to the home screen"
        disabled={isButtonDisabled} // Disable the button if `isButtonDisabled` is true
      >
        <Text style={winnerstyles.buttonText}>Home</Text>
      </Pressable>
      
      {/* Button to share the result */}
      <Pressable 
        style={winnerstyles.button} 
        onPress={handleShare} 
        accessibilityLabel="Share"
        accessibilityHint="Shares your result with others"
      >
        <Text style={winnerstyles.buttonText}>Share</Text>
      </Pressable>
      
      {/* Button to restart the game */}
      <Pressable
        style={winnerstyles.button} 
        onPress={handlePlayAgain} 
        accessibilityLabel="Play Again"
        accessibilityHint="Restarts the game for another round"
        disabled={isButtonDisabled} // Disable the button if `isButtonDisabled` is true
      >
        <Text style={winnerstyles.buttonText}>Play Again</Text>
      </Pressable>
    </View>
  );
};
