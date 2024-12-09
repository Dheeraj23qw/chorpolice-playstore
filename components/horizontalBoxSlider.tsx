import React, { memo, useEffect } from "react";
import {
  Text,
  Pressable,
  View,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./_CSS/horizontalBoxslider";

interface ButtonOption {
  label: string;
  value: string;
  backgroundImage: string | ReturnType<typeof require>; // Accept both URI string or require
}

interface AvatarWithBackgroundProps {
  selectedOption: string | null;
  setSelectedOption: (option: string | null) => void;
  options: ButtonOption[];
  title: string; // Text to overlay on the background image
  botCount: number;
  humanCount: number;
}

const AvatarWithBackground: React.FC<AvatarWithBackgroundProps> = ({
  selectedOption,
  setSelectedOption,
  options,
  title,
  botCount,
  humanCount,
}) => {
  const handleOptionSelect = (option: ButtonOption) => {
    setSelectedOption(selectedOption === option.value ? null : option.value);
  };

  useEffect(() => {
    if (!selectedOption && options.length > 0) {
      // Automatically select the first option if none is selected
      setSelectedOption(options[0].value);
    }
  }, [options, selectedOption]);

  useEffect(() => {
    if (botCount === 3) {
      setSelectedOption("human"); // Automatically select human if bots reach 3
    } else if (humanCount === 3) {
      setSelectedOption("robot"); // Automatically select robot if humans reach 3
    }
  }, [botCount, humanCount]); // Ensure these are properly monitored

  return (
    <View style={styles.backgroundImage}>
      <Text style={styles.title}>{title}</Text>

      {/* Options Slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.toggleContainer}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleOptionSelect(option)}
              style={[
                styles.optionButton,
                selectedOption === option.value && styles.selectedOption,
              ]}
              accessibilityLabel={`${option.label} option`}
              accessible
            >
              <ImageBackground
                source={
                  typeof option.backgroundImage === "string"
                    ? { uri: option.backgroundImage }
                    : option.backgroundImage
                }
                style={styles.optionBackground}
                resizeMode="cover"
              >
                {/* Overlay for better text visibility */}
                <View style={overlayStyles.overlay}>
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={selectedOption === option.value ? "#FFD700" : "#ccc"}
                  />
                  <Text style={overlayStyles.optionText}>{option.label}</Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Wrap the component with React.memo for optimization
export const AvatarWithBackgroundMemo = memo(AvatarWithBackground);

// Overlay styles for better text visibility
const overlayStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // Makes the overlay cover the entire ImageBackground
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent black overlay
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    color: "#FFD700", // Gold text color for better contrast
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
