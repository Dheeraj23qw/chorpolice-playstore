import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { Href, useRouter } from "expo-router"; // Import useRouter from expo-router
import GameModeScrollViewStyles from "./_CSS/gamemodeScroll"; // Import styles
import { FontAwesome } from "@expo/vector-icons"; // Importing icon library
import Animated, { BounceIn, BounceOut } from "react-native-reanimated";

// Define Option type
export interface Option {
  label: string; // Label to display for the option
  value: string; // Value to handle when the option is selected
  backgroundId: number; // Background ID to select the image
  route: string; // Route to navigate when the option is clicked
}

// Map background images to IDs
const BACKGROUND_IMAGES: Record<number, any> = {
  1: require("../assets/images/bg/gamemode/1.png"),
  2: require("../assets/images/bg/gamemode/2.png"),
  3: require("../assets/images/bg/gamemode/3.png"),
  4: require("../assets/images/bg/gamemode/4.png"),
};

const GameModeScrollView: React.FC<{ options: Option[] }> = ({ options }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const router = useRouter(); // Initialize the router

  const handleSelect = (value: string, route: string) => {
    setSelectedOption(value); // Update local state
    router.push(route as Href); // Navigate to the specified route
  };

  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={GameModeScrollViewStyles.scrollViewContainer}
      >
        {options.map((option, index) => {
          const isSelected = selectedOption === option.value;
          const backgroundImage = BACKGROUND_IMAGES[option.backgroundId]; // Get background based on ID

          return (
            <Animated.View
              key={index}
              entering={BounceIn.delay(index * 100)} // Staggered bounce-in animations
              exiting={BounceOut} // Smooth bounce-out animation
              style={{ marginBottom: 10 }}
            >
              <Pressable
                onPress={() => handleSelect(option.value, option.route)} // Pass route for navigation
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1, // Slight fade effect on press
                  },
                ]}
              >
                <ImageBackground
                  source={backgroundImage} // Dynamically set background image
                  style={[
                    GameModeScrollViewStyles.itemContainer,
                    isSelected && GameModeScrollViewStyles.selectedItem,
                  ]} // Apply styles, conditionally for selected item
                  resizeMode="cover"
                >
                  <View style={GameModeScrollViewStyles.overlay} />

                  {/* Main content area */}
                  <View style={GameModeScrollViewStyles.content}>
                    {/* Text rendered within the ImageBackground */}
                    <Text
                      style={[
                        GameModeScrollViewStyles.text,
                        isSelected && GameModeScrollViewStyles.selectedText,
                      ]}
                    >
                      {option.label}
                    </Text>

                    {/* Tick icon below the name */}
                    <View style={GameModeScrollViewStyles.tickContainer}>
                      <FontAwesome
                        name="check-circle"
                        size={24}
                        color={isSelected ? "#FFD700" : "white"} // Yellow if selected, white if not
                      />
                    </View>
                  </View>
                </ImageBackground>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default GameModeScrollView;
