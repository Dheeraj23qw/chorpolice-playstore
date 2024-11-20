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
    padding: responsiveWidth(5),
  },
  playersSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: responsiveHeight(2),
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
    borderRadius: responsiveWidth(7),
  },
  playerName: {
    color: "#fff",
    fontSize: responsiveWidth(4.5),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: responsiveHeight(1.5),
  },
  vsCircle: {
    width: responsiveHeight(12),
    height: responsiveHeight(12),
    justifyContent: "center",
    alignItems: "center",
  },
  vsCircleImage: {
    borderRadius: responsiveHeight(6),
  },
  vsText: {
    fontSize: responsiveWidth(6),
    fontWeight: "900",
    color: "#7653ec",
  },
  circularSection: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: responsiveHeight(0.2),
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
    marginBottom: responsiveHeight(3),
  },
  questionBackground: {
    width: "100%",
    paddingVertical: responsiveHeight(3),
    justifyContent: "center",
    alignItems: "center",
  },
  questionBackgroundImage: {
    borderRadius: responsiveWidth(4),
  },
  questionText: {
    color: "#FFF",
    fontSize: responsiveWidth(5),
    fontWeight: "700",
    textAlign: "center",
  },
  optionsSection: {
    paddingHorizontal: responsiveWidth(5),
  },
  optionBackground: {
    flex: 1,
    borderRadius: responsiveWidth(4),
    marginBottom: responsiveHeight(1.5),
    justifyContent: "center",
    alignItems: "center",
  },
  optionBackgroundImage: {
    borderRadius: responsiveWidth(4),
  },
  optionButton: {
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(8),
    alignItems: "center",
  },
  optionText: {
    color: "#FFF",
    fontSize: responsiveWidth(4),
    fontWeight: "900",
  },
  buttonsSection: {
    marginTop: responsiveHeight(4),
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconBackground: {
    width: responsiveWidth(28),
    height: responsiveHeight(7),
    marginHorizontal: responsiveWidth(1),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: responsiveWidth(4),
  },
  iconBackgroundImage: {
    borderRadius: responsiveWidth(4),
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveHeight(1),
  },
  iconText: {
    color: "#FFF",
    fontSize: responsiveWidth(4),
    fontWeight: "bold",
  },
});

