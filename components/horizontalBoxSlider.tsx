import React, { memo, useEffect, useRef } from "react";
import {
  Text,
  Pressable,
  View,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./_CSS/horizontalBoxslider";

interface ButtonOption {
  label: string;
  value: string;
  backgroundImage: string | ReturnType<typeof require>;
}

interface AvatarWithBackgroundProps {
  selectedOption: string | null;
  setSelectedOption: (option: string | null) => void;
  options: ButtonOption[];
  title: string;
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
  const animation = useRef(new Animated.Value(1)).current;

  const handleOptionSelect = (option: ButtonOption) => {
    // Set selected option
    setSelectedOption(selectedOption === option.value ? null : option.value);

    // Trigger bounce animation
    Animated.spring(animation, {
      toValue: 1.4, // Scale up
      friction: 3, // Adjust friction for a smoother bounce
      tension: 100, // Adjust tension for better response
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(animation, {
        toValue: 1.4, // Scale back down
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    if (!selectedOption && options.length > 0) {
      setSelectedOption(options[0].value);
    }
  }, [options, selectedOption]);

  useEffect(() => {
    if (botCount === 3) {
      setSelectedOption("human");
    } else if (humanCount === 3) {
      setSelectedOption("robot");
    }
  }, [botCount, humanCount]);

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
          {options.map((option) => {
            // Create an individual animated value for each option
            const optionAnimation = selectedOption === option.value ? animation : new Animated.Value(1);
            
            return (
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
                <Animated.View
                  style={{
                    transform: [{ scale: optionAnimation }],
                  }}
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
                      <Text style={styles.optionText}>{option.label}</Text>
                    </View>
                  </ImageBackground>
                </Animated.View>
              </Pressable>
            );
          })}
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
