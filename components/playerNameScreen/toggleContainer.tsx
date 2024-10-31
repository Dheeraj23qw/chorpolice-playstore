import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./_css/optionbarcss";
import { useRouter } from "expo-router";

// Define a type for AvatarSelectionProps for better type safety
interface AvatarSelectionProps {
  selectedOption: string | null;
  setSelectedOption: React.Dispatch<React.SetStateAction<string | null>>;
  pickImage: () => Promise<void>;
}

// Create the AvatarSelection component
const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  selectedOption,
  setSelectedOption,
  pickImage,
}) => {
  const router = useRouter();
  // Toggle the selected option for bots
  const toggleBotsOption = () => {
    setSelectedOption((prev) => (prev === "bots" ? null : "bots"));
    router.push("./playwithbot");
  };

  // Handle selection from the gallery and ensure pickImage is awaited
  const handleGallerySelection = async () => {
    try {
      setSelectedOption((prev) => (prev === "gallery" ? null : "gallery"));
      await pickImage();
    } catch (error) {
      console.error("Error picking image: ", error);
      // Optionally, display an alert or user message
    }
  };

  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        onPress={toggleBotsOption}
        style={[
          styles.optionButton,
          selectedOption === "bots" && styles.selectedOption,
        ]}
        accessibilityLabel="Play with Bots option"
        accessible
      >
        <MaterialIcons
          name="check-circle"
          size={24}
          color={selectedOption === "bots" ? "#FFD700" : "#ccc"}
        />
        <Text style={styles.optionText}>Play with Bots!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleGallerySelection}
        style={[
          styles.optionButton,
          selectedOption === "gallery" && styles.selectedOption,
        ]}
        accessibilityLabel="Upload from Gallery option"
        accessible
      >
        <MaterialIcons
          name="check-circle"
          size={24}
          color={selectedOption === "gallery" ? "#FFD700" : "#ccc"}
        />
        <Text style={styles.optionText}>Upload from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};

// Wrap the component with React.memo for optimization
export const AvatarSelectionMemo = memo(AvatarSelection);
