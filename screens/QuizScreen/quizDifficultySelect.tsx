import React, { useEffect, useState, useCallback } from "react";
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
import { responsiveFontSize } from "react-native-responsive-dimensions";

type DifficultyOption = "easy" | "medium" | "hard";
const GIF_IDS: Record<DifficultyOption, number> = {
  easy: 9,
  medium: 10,
  hard: 11,
};

// BackButton Component
const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.backButton} onPress={onPress}>
    <Ionicons name="arrow-back" size={responsiveFontSize(3)} color="#FFD700" />
  </Pressable>
);

// QuestionSection Component
const QuestionSection = () => (
  <View style={styles.questionSection}>
    <ImageBackground
      source={require("../../assets/images/bg/quiz3.png")}
      style={styles.questionBackground}
      imageStyle={styles.questionBackgroundImage}
    >
      <Text style={styles.questionText}>Select Quiz Difficulty Level</Text>
    </ImageBackground>
  </View>
);

// Option Component
const Option = ({
  option,
  isSelected,
  onSelect,
}: {
  option: DifficultyOption;
  isSelected: boolean;
  onSelect: (option: DifficultyOption) => void;
}) => (
  <Pressable
    onPress={() => onSelect(option)}
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
      <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
        {option}
      </Text>
    </ImageBackground>
  </Pressable>
);

// OptionsSection Component
const OptionsSection = ({
  options,
  selectedOption,
  onSelect,
}: {
  options: DifficultyOption[];
  selectedOption: DifficultyOption | null;
  onSelect: (option: DifficultyOption) => void;
}) => (
  <View style={styles.optionsSection}>
    {options.map((option, index) => (
      <Option
        key={index}
        option={option}
        isSelected={selectedOption === option}
        onSelect={onSelect}
      />
    ))}
  </View>
);

const ImageSelectScreen = () => {
  const router = useRouter();
  const options: DifficultyOption[] = ["easy", "medium", "hard"];
  const [selectedOption, setSelectedOption] = useState<DifficultyOption | null>(null);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">("image");
  const dispatch = useDispatch();

  const handleOptionSelect = useCallback(
    (option: DifficultyOption) => {
      if (options.includes(option) && selectedOption !== option) {
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
    },
    [dispatch, options, selectedOption]
  );



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
          <StatusBar backgroundColor={"transparent"} />
          <View style={styles.overlay} />
          <BackButton onPress={() => router.replace("/modeselect")} />

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
            <QuestionSection />

            {/* Options Section */}
            <OptionsSection
              options={options}
              selectedOption={selectedOption}
              onSelect={handleOptionSelect}
            />

            {/* Start Button */}
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
      )}
    </>
  );
};

export default React.memo(ImageSelectScreen);
