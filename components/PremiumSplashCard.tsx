import React from "react";
import { View, StyleSheet, ImageSourcePropType } from "react-native";
import { MotiView, MotiImage } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Easing } from "react-native-reanimated";

interface PremiumSplashCardProps {
  source: ImageSourcePropType;
}

export const PremiumSplashCard: React.FC<PremiumSplashCardProps> = ({
  source,
}) => {
  return (
    <View style={styles.container}>
      {/* 🎬 MAIN ANIMATED CONTAINER (ZOOM OUT EFFECT) */}
      <MotiView
        from={{
          opacity: 0,
          scale: 1.3, // Starts zoomed in
        }}
        animate={{
          opacity: 1,
          scale: 1, // Zooms out to natural size
        }}
        transition={{
          type: "timing",
          duration: 2500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }}
        style={styles.cardWrapper}
      >
        {/* THE CARD IMAGE */}
        <MotiImage source={source} style={styles.image} resizeMode="contain" />

        {/* ✨ FADED GLASSY TRANSPARENT LAYER */}
        <View pointerEvents="none" style={styles.glassLayer}>
          {/* Main Frosting Gradient */}
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.12)",
              "rgba(255, 255, 255, 0.02)",
              "rgba(0, 0, 0, 0.3)",
            ]}
            style={StyleSheet.absoluteFill}
          />

          {/* Specular Diagonal Light Streak */}
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* GLASS EDGE RIM LIGHT */}
        <View style={styles.glassBorder} pointerEvents="none" />
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  cardWrapper: {
    width: "80%", // centered card look
    aspectRatio: 3 / 4.2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    overflow: "hidden",
    // Premium outer shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  glassLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
  },
  glassBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: 32,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 3,
  },
});
