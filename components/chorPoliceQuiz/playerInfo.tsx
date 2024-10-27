import React, { memo } from 'react';
import { View, Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { chorPoliceQuizstyles } from '@/screens/chorPoliceQuizScreen/quizStyle';

type PlayerInfoProps = {
  playerImage: ImageSourcePropType;
};

// Define styles once using StyleSheet.create
const styles = StyleSheet.create({
  playerInfo: chorPoliceQuizstyles.playerInfo,
  playerImage: chorPoliceQuizstyles.playerImage,
});

/**
 * PlayerInfo component renders a player's image inside a styled view.
 * @param {PlayerInfoProps} props - The props containing the player image source.
 */
const PlayerInfo: React.FC<PlayerInfoProps> = memo(({ playerImage }) => (
  <View style={styles.playerInfo}>
    <Image source={playerImage} style={styles.playerImage} />
  </View>
));

export default PlayerInfo;
