import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveScreenWidth,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";

export default function ImageSelectScreen() {
  const router = useRouter();
  const options = ["Easy", "Medium", "Hard"];
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <ImageBackground
      source={require("../../assets/images/bg/quizbg2.png")} // Background image
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Circular Section */}
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
              Select Quiz Difficulty Level
            </Text>
          </ImageBackground>
        </View>

        {/* Options Section */}
        <View style={styles.optionsSection}>
  {options.map((option, index) => (
    <Pressable
      key={index}
      onPress={() => setSelectedOption(option)}
      style={({ pressed }) => [
        styles.optionPressable,
        pressed && styles.optionPressed,
      ]}
    >
      <ImageBackground
        source={require("../../assets/images/bg/quiz3.png")}
        style={styles.optionBackground}
        imageStyle={styles.optionBackgroundImage}
      >
        <Text
          style={[
            styles.optionText,
            selectedOption === option && styles.selectedOptionText,
          ]}
        >
          {option}
        </Text>
      </ImageBackground>
    </Pressable>
  ))}
</View>
        {selectedOption && (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <CustomButton
              label={"Start"}
              onPress={() => router.push("/quiz")}
              backgroundColor={"#ad96f2"}
            />
          </View>
        )}
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

  circularSection: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveHeight(10),
    marginBottom: responsiveHeight(4),
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
    fontSize: responsiveFontSize(2.6),
    fontWeight: "900",
    textAlign: "center",
  },
  optionsSection: {
    paddingHorizontal: responsiveWidth(15),
  },

  optionButton: {
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(8),
    alignItems: "center",
  },
  
 
  optionPressable: {
    width: "100%", // Ensure Pressable stretches within the container
    height: responsiveHeight(8), // Set a consistent height for options
    borderRadius: responsiveWidth(4),
    marginBottom: responsiveHeight(3),
    overflow: "hidden",
  },
  optionBackground: {
    ...StyleSheet.absoluteFillObject, // Makes the ImageBackground fill its parent
    justifyContent: "center",
    alignItems: "center",
  },
  optionBackgroundImage: {
    resizeMode: "cover", // Ensures image scales correctly
  },
  optionPressed: {
    opacity: 0.9, // Feedback for when pressed
  },
  optionText: {
    color: "#FFF",
    fontSize: responsiveFontSize(2.4),
    fontWeight: "900",
  },
  selectedOptionText: {
    color: "gold",
  },
});
