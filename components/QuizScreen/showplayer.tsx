import React from "react";
import { StyleSheet, Text, View, ImageBackground, Image } from "react-native";
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";

export default function ShowPlayer() {


  return (
    <ImageBackground
      source={require("@/assets/images/bg/quizbg.png")} // Background image
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Player at top-left */}
      <View style={[styles.playerContainer, styles.topLeft]}>
        <View style={styles.imageOverlayContainer}>
          <Image
            source={{
              uri: "https://thumbs.dreamstime.com/b/d-avatar-little-boy-dressed-as-construction-worker-complete-hard-hat-tools-330397838.jpg",
            }}
            style={styles.playerImage}
          />
          <View style={styles.textOverlay}>
            <Text style={styles.playerName}>Player 1</Text>
          
          </View>
        </View>
      </View>

      {/* Player at bottom-right */}
      <View style={[styles.playerContainer, styles.bottomRight]}>
        <View style={styles.imageOverlayContainer}>
          <Image
            source={{
              uri: "https://thumbs.dreamstime.com/b/d-avatar-little-boy-dressed-as-construction-worker-complete-hard-hat-tools-330397838.jpg",
            }}
            style={styles.playerImage}
          />
          <View style={styles.textOverlay}>
            <Text style={styles.playerName}>Player 2</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire background
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent black
  },
  playerContainer: {
    position: "absolute",
    alignItems: "center",
  },
  topLeft: {
    top: rh(20),
    right: rw(0),
  },
  bottomRight: {
    bottom: rh(20),
    left: rw(0),
  },
  imageOverlayContainer: {
    position: "relative",
    width: rw(50),
    height: rw(50),
    borderRadius: rw(15),
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#FFD700",
  },
  playerImage: {
    width: "100%",
    height: "100%",
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    marginTop: rh(13),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
    padding: rh(2),
  },
  playerName: {
    color: "#FFD700",
    fontSize: rf(2.5),
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    marginBottom: rh(1),
  },
  scoreText: {
    color: "white",
    fontSize: rf(2),
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});
