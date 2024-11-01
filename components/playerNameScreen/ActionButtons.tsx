import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { playerNameStyles } from '@/screens/playerNameScreen/playerNameCss';

interface ActionButtonsProps {
  handleStartAdventure?: () => void;
  disabled?: boolean; // Add disabled property
}

const PlayernameActionButtonsComponent: React.FC<ActionButtonsProps> = ({ handleStartAdventure, disabled }) => (
  <View style={playerNameStyles.infoButtonContainer}>
    {handleStartAdventure && (
      <TouchableOpacity
        style={[playerNameStyles.startGameButton, disabled && { opacity: 0.5 }]} // Change style based on disabled state
        onPress={handleStartAdventure}
        disabled={disabled} // Disable the button if disabled is true
      >
        <Text style={playerNameStyles.startGameButtonText}>Start Adventure 🚀</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const PlayernameActionButtons = memo(PlayernameActionButtonsComponent);
