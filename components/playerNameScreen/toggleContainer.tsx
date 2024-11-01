import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./_css/optionbarcss";
import { useRouter } from "expo-router";

// Define a type for ButtonOption
interface ButtonOption {
  label: string;
  value: string;
}

// Define a type for AvatarSelectionProps for better type safety
interface AvatarSelectionProps {
  selectedOption: string | null;
  setSelectedOption: React.Dispatch<React.SetStateAction<string | null>>;
  pickImage: () => Promise<void>;
  options: ButtonOption[]; // Accept an array of options
}

// Create the AvatarSelection component
const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  selectedOption,
  setSelectedOption,
  pickImage,
  options, // Destructure options
}) => {
  const router = useRouter();

  // Toggle the selected option and navigate to corresponding route
  const handleOptionSelect = (option: ButtonOption) => {
    setSelectedOption((prev) => (prev === option.value ? null : option.value));

    // Example routing logic, adjust based on your actual routes
    if (option.value === "bots") {
      router.push("/playwithbot");
    } else if (option.value === "gallery") {
      // Handle gallery option
      handleGallerySelection();
    }
  };

  // Handle selection from the gallery and ensure pickImage is awaited
  const handleGallerySelection = async () => {
    try {
      setSelectedOption((prev) => (prev === "gallery" ? null : "gallery"));
      await pickImage();
    } catch (error) {
      console.error("Error picking image: ", error);
    }
  };

  return (
    <View style={styles.toggleContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value} // Unique key for each option
          onPress={() => handleOptionSelect(option)}
          style={[
            styles.optionButton,
            selectedOption === option.value && styles.selectedOption,
          ]}
          accessibilityLabel={`${option.label} option`}
          accessible
        >
          <MaterialIcons
            name="check-circle"
            size={24}
            color={selectedOption === option.value ? "#FFD700" : "#ccc"}
          />
          <Text style={styles.optionText}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Wrap the component with React.memo for optimization
export const AvatarSelectionMemo = memo(AvatarSelection);
