import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

export default function QuizScreen() {
  const [countdown, setCountdown] = useState(30);
  const options = ["Option 1", "Option 2", "Option 3"];
  const buttons = [
    { id: 1, text: "Draw" },
    { id: 2, text: "Quit" },
    { id: 3, text: "ScoreBoard" },
  ];

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 0));
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/bg/quizbg2.png")} // Background image
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Players Section with Timer Countdown */}
        <View style={styles.playersSection}>
          <View style={styles.playerWrapper}>
            <ImageBackground
              source={require("../../assets/images/chorsipahi/kid1.png")} // Player 1 background
              style={styles.playerCard}
              imageStyle={styles.playerCardImage}
            />
            <Text style={styles.playerName}>Player 1</Text>
          </View>
          <ImageBackground
            source={require("../../assets/images/bg/timer.png")} // Timer background
            style={styles.vsCircle}
            imageStyle={styles.vsCircleImage}
          >
            <Text style={styles.vsText}>{countdown}</Text>
          </ImageBackground>
          <View style={styles.playerWrapper}>
            <ImageBackground
              source={require("../../assets/images/chorsipahi/kid5.png")} // Player 2 background
              style={styles.playerCard}
              imageStyle={styles.playerCardImage}
            />
            <Text style={styles.playerName}>Player 2</Text>
          </View>
        </View>

        {/* New Circular Section */}
        <View style={styles.circularSection}>
          <ImageBackground
            source={require("../../assets/images/bg/quizbg5.png")} // Circular background
            style={styles.circularBackground}
            imageStyle={styles.circularBackgroundImage}
          />
        </View>

        {/* Question Section */}
        <View style={styles.questionSection}>
          <ImageBackground
            source={require("../../assets/images/bg/quiz3.png")} // Question background
            style={styles.questionBackground}
            imageStyle={styles.questionBackgroundImage}
          >
            <Text style={styles.questionText}>
              What is the capital of France?
            </Text>
          </ImageBackground>
        </View>

        {/* Options Section */}
        <View style={styles.optionsSection}>
          {options.map((option, index) => (
            <ImageBackground
              key={index}
              source={require("../../assets/images/bg/quiz3.png")}
              style={styles.optionBackground}
              imageStyle={styles.optionBackgroundImage}
            >
              <Pressable style={styles.optionButton}>
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            </ImageBackground>
          ))}
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsSection}>
          {buttons.map((button) => (
            <ImageBackground
              key={button.id}
              source={require("../../assets/images/bg/quiz3.png")}
              style={styles.iconBackground}
              imageStyle={styles.iconBackgroundImage}
            >
              <TouchableOpacity style={styles.iconButton}>
                <Text style={styles.iconText}>{button.text}</Text>
              </TouchableOpacity>
            </ImageBackground>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  playersSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
    marginTop: responsiveHeight(6),
  },
  playerWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  playerCard: {
    width: responsiveWidth(30),
    height: responsiveHeight(15),
    justifyContent: "center",
    alignItems: "center",
  },
  playerCardImage: {
    borderRadius: 15,
  },
  playerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: responsiveHeight(2),
  },
  vsCircle: {
    width: responsiveHeight(15),
    height: responsiveHeight(14),
    justifyContent: "center",
    alignItems: "center",
  },
  vsCircleImage: {
    borderRadius: responsiveHeight(8),
  },
  vsText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#7653ec",
  },
  circularSection: {
    justifyContent: "center",
    alignItems: "center",
  },
  circularBackground: {
    width: responsiveHeight(16),
    height: responsiveHeight(16),
    justifyContent: "center",
    alignItems: "center",
  },
  circularBackgroundImage: {
    borderRadius: responsiveHeight(8),
  },
  questionSection: {
    marginBottom: responsiveHeight(4),
  },
  questionBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  questionBackgroundImage: {
    borderRadius: 15,
  },
  questionText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  optionsSection: {
    paddingHorizontal: 26,
  },
  optionBackground: {
    flex: 1,
    borderRadius: 28,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  optionBackgroundImage: {
    borderRadius: 12,
  },
  optionButton: {
    paddingVertical: 15,
    paddingHorizontal: 36,
    marginBottom: 12,
    alignItems: "center",
  },
  optionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
  },
  buttonsSection: {
    marginTop: responsiveHeight(5),
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconBackground: {
    flex: 1,
    marginHorizontal: responsiveWidth(1),
    height: responsiveHeight(7),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
  },
  iconBackgroundImage: {
    borderRadius: 12,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
