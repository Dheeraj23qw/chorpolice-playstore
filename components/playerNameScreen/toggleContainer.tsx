import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./_css/optionbarcss";
import { useRouter } from "expo-router";

interface ButtonOption {
  label: string; // Label for the button to be displayed
  value: string; // Value associated with the button option
}

interface AvatarSelectionProps {
  selectedOption: string | null;
  setSelectedOption: (option: string | null) => void;
  pickImage: () => Promise<void>;
  options: ButtonOption[];
}

// Create the AvatarSelection component
const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  selectedOption,
  setSelectedOption,
  pickImage,
  options,
}) => {
  const router = useRouter();

  // Toggle the selected option and navigate to the corresponding route
  const handleOptionSelect = (option: ButtonOption) => {
    if (option.value === "gallery") {
      handleGallerySelection();
    } else {
      const newSelection =
        selectedOption === option.value ? null : option.value;
      setSelectedOption(newSelection);
    }
  };

  // Handle selection from the gallery and ensure pickImage is awaited
  const handleGallerySelection = async () => {
    try {
      setSelectedOption("gallery"); // Set the option as selected
      await pickImage(); // Await the image picking process
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
