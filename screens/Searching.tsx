import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  StatusBar,
} from "react-native";
import { useDeveloperMessages } from "@/hooks/useDeveloperMessages";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

const SearchingForPlayers = () => {
  const currentMessage = useDeveloperMessages();

  return (
    <ImageBackground
      source={require("@/assets/images/bg/quiz.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar backgroundColor={"transparent"} />
      <View style={styles.overlay} />
      <Text style={styles.heading}>Finding Opponents...</Text>
      <View style={styles.message}>
        <Text style={styles.line}>{currentMessage}</Text>
      </View>
      <ActivityIndicator size="large" color="#FFD700" />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(5), // Responsive padding
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Dark overlay for better text contrast
  },
  heading: {
    fontSize: responsiveFontSize(3), // Responsive font size
    fontWeight: "bold",
    color: "#ffffff", // White text for better readability
    marginVertical: responsiveHeight(2), // Responsive margin
  },
  message: {
    marginTop: responsiveHeight(2),
    alignItems: "center",
    marginBottom: responsiveHeight(10),
  },
  line: {
    fontSize: responsiveFontSize(2.4), // Responsive font size
    textAlign: "center",
    color: "#ffffff", // White text
    marginVertical: responsiveHeight(1), // Responsive margin
  },
});

export default SearchingForPlayers;
