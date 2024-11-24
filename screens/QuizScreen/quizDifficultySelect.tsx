import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Pressable,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { styles } from "@/screens/QuizScreen/_styles/imageSelectStyles";
import { setDifficulty } from "@/redux/reducers/quiz";
import { playSound } from "@/redux/reducers/soundReducer";

type DifficultyOption = "easy" | "medium" | "hard"; // Explicit type for options

export default function ImageSelectScreen() {
  const router = useRouter();
  const options: DifficultyOption[] = ["easy", "medium", "hard"]; // Use the specific type for options
  const [selectedOption, setSelectedOption] = useState<DifficultyOption | null>(null); // Type the local state
  const dispatch = useDispatch();

  const handleOptionSelect = (option: string) => {
    dispatch(playSound("select"));

    // Type assertion to ensure the option is valid (only "easy", "medium", "hard" are allowed)
    if (options.includes(option as DifficultyOption)) {
      setSelectedOption(option as DifficultyOption); // Update local state
      dispatch(setDifficulty(option as DifficultyOption)); // Dispatch Redux action with correct type
    }
  };

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
              onPress={() => handleOptionSelect(option)} // Update both state and Redux on press
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
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
