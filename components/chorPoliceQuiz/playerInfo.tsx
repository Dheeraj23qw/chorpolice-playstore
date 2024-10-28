import React, { memo } from "react";
import { View, Image, ImageSourcePropType, StyleSheet } from "react-native";
import { chorPoliceQuizstyles } from "@/screens/chorPoliceQuizScreen/quizStyle";

// Define the PlayerInfoProps type
type PlayerInfoProps = {
  playerImage: { type: string; src: any }; // Update the type definition
};

// Utility function to get the image source
const getImageSource = (imageData: { type: string; src: any }) => {
  return imageData.type === "local" ? imageData.src : { uri: imageData.src };
};

// Define styles once using StyleSheet.create
const styles = StyleSheet.create({
  playerInfo: chorPoliceQuizstyles.playerInfo,
  playerImage: chorPoliceQuizstyles.playerImage,
});

const PlayerInfo: React.FC<PlayerInfoProps> = memo(({ playerImage }) => {
  const imageSource = getImageSource(playerImage); // Use the utility function to get the image source

  return (
    <View style={styles.playerInfo}>
      <Image source={imageSource} style={styles.playerImage} />
    </View>
  );
});

export default PlayerInfo;
