import React, { memo, useEffect, useRef, useState } from "react";
import { View, Image, Animated, StyleSheet, Pressable } from "react-native";
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
  const [bounceAnim] = useState(new Animated.Value(1)); // Bouncing effect on image click
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade-in effect when the component mounts
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Scale-up effect for the image

  const imageSource = getImageSource(playerImage);

  // Only start the fade and scale animations if an image is provided
  useEffect(() => {
    if (imageSource) {
      // Start fade-in effect when component mounts
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [imageSource]);

  // Handle the bounce effect when the image is clicked
  const handleImagePress = () => {
    Animated.sequence([
      Animated.spring(bounceAnim, {
        toValue: 1.1, // Scale up
        friction: 3, // Control the bounce effect
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1, // Return to the original size
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // If no image is provided, return null
  if (!imageSource) return null;

  return (
    <View style={styles.playerInfo}>
      <Pressable onPress={handleImagePress}>
        <Animated.View
          style={[
            {
              opacity: fadeAnim, // Fade-in effect
              transform: [
                { scale: scaleAnim }, // Scale-up effect
                { scale: bounceAnim }, // Bounce effect on click
              ],
            },
          ]}
        >
          <Image source={imageSource} style={styles.playerImage} />
        </Animated.View>
      </Pressable>
    </View>
  );
});

export default PlayerInfo;
