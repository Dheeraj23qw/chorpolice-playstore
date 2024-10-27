import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { playerNameStyles } from '@/screens/playerNameScreen/playerNameCss';

interface ActionButtonsProps {
  showGameInfo?: () => void;
  handleStartAdventure?: () => void;
}

const PlayernameActionButtonsComponent: React.FC<ActionButtonsProps> = ({ showGameInfo, handleStartAdventure }) => (
  <View style={playerNameStyles.infoButtonContainer}>
    {showGameInfo && (
      <TouchableOpacity style={playerNameStyles.infoButton} onPress={showGameInfo}>
        <Text style={playerNameStyles.infoButtonText}>🎮 Game Info</Text>
      </TouchableOpacity>
    )}

    {handleStartAdventure && (
      <TouchableOpacity
        style={playerNameStyles.startGameButton}
        onPress={handleStartAdventure}
      >
        <Text style={playerNameStyles.startGameButtonText}>Start Adventure 🚀</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const PlayernameActionButtons = memo(PlayernameActionButtonsComponent);
