import React, { memo } from "react";
import { View, Image, StyleSheet } from "react-native";
import { chorPoliceQuizstyles } from "@/screens/chorPoliceQuizScreen/quizStyle";

// Define the PlayerInfoProps type
type PlayerInfoProps = {
  playerImage?: { type: string; src: any }; // Make playerImage optional
};

// Utility function to get the image source
const getImageSource = (imageData?: { type: string; src: any }) => {
  if (!imageData) return null; // Return null if imageData is undefined
  return imageData.type === "local" ? imageData.src : { uri: imageData.src };
};

// Define styles once using StyleSheet.create
const styles = StyleSheet.create({
  playerInfo: chorPoliceQuizstyles.playerInfo,
  playerImage: chorPoliceQuizstyles.playerImage,
});

const PlayerInfo: React.FC<PlayerInfoProps> = memo(({ playerImage }) => {
  const imageSource = getImageSource(playerImage);

  if (!imageSource) return null; // Avoid rendering if imageSource is null

  return (
    <View style={styles.playerInfo}>
      <Image source={imageSource} style={styles.playerImage} />
    </View>
  );
});

export default PlayerInfo;
