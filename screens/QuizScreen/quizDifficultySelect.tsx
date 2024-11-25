import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  BackHandler,
} from "react-native";
import { useDispatch } from "react-redux";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { styles } from "@/screens/QuizScreen/_styles/quizDifficultyStyles";
import { setDifficulty } from "@/redux/reducers/quiz";
import { playSound } from "@/redux/reducers/soundReducer";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { Ionicons } from "@expo/vector-icons";

type DifficultyOption = "easy" | "medium" | "hard";
const GIF_IDS: Record<DifficultyOption, number> = {
  easy: 9,
  medium: 10,
  hard: 11,
};
export default function ImageSelectScreen() {
  const router = useRouter();
  const options: DifficultyOption[] = ["easy", "medium", "hard"];
  const [selectedOption, setSelectedOption] = useState<DifficultyOption | null>(
    null
  );
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">(
    "image"
  );
  const dispatch = useDispatch();

  const handleOptionSelect = (option: DifficultyOption) => {
    if (options.includes(option)) {
      dispatch(playSound("select"));
      setMediaId(GIF_IDS[option]);
      setMediaType("gif");
      setIsDynamicPopUp(true);
      setSelectedOption(option);
      dispatch(setDifficulty(option));

      setTimeout(() => {
        setIsDynamicPopUp(false);
      }, 2500);
    }
  };

  useEffect(() => {
    const backAction = () => {
      // Prevent back navigation when arrow is clicked
      return true; // Returning true here prevents default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Clean up the listener when component unmounts
  }, []);

  return (
    <>
      {isDynamicPopUp ? (
        <ImageBackground
          source={require("../../assets/images/bg/quizbg2.png")}
          style={styles.backgroundImage}
        >
          <StatusBar backgroundColor={"#000000CC"} />
          <DynamicOverlayPopUp
            isPopUp={isDynamicPopUp}
            mediaId={mediaId}
            mediaType={mediaType}
            closeVisibleDelay={2500}
          />
        </ImageBackground>
      ) : (
        <ImageBackground
          source={require("../../assets/images/bg/quizbg2.png")}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />
          <Pressable
            onPress={() => router.navigate("/modeselect")}
            style={[styles.backButton]} // Apply the backButton style
          >
            <Ionicons
              name="arrow-back"
              size={35}
              color="gold"
              style={styles.icon3D} // Apply the icon3D style
            />
          </Pressable>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Circular Section */}
            <View style={styles.circularSection}>
              <ImageBackground
                source={require("../../assets/images/bg/quizbg5.png")}
                style={styles.circularBackground}
                imageStyle={styles.circularBackgroundImage}
              />
            </View>

            {/* Question Section */}
            <View style={styles.questionSection}>
              <ImageBackground
                source={require("../../assets/images/bg/quiz3.png")}
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
                  onPress={() => handleOptionSelect(option)}
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
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
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
      )}
    </>
  );
}
