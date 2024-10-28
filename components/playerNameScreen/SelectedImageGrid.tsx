import React, { useMemo, memo } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { playerNameStyles } from "@/screens/playerNameScreen/playerNameCss";
import { playerImages } from "@/constants/playerData";

interface SelectedImageGridProps {
  selectedImages: number[];
  imageNames: Record<number, string>;
  handleNameChange: (imageId: number, name: string) => void;
  handleSelectedImageClick: (imageId: number) => void;
}

// Create imagesArray outside of the component
const imagesArray = Object.entries(playerImages).map(([key, image]) => ({
  id: Number(key),
  // Use either `src` for local or URI for gallery
  image: image.type === "local" ? image.src : { uri: image.src },
}));

const SelectedImageGridComponent: React.FC<SelectedImageGridProps> = ({
  selectedImages,
  imageNames,
  handleNameChange,
  handleSelectedImageClick,
}) => {
  const handleTextChange = (imgId: number) => (text: string) => {
    handleNameChange(imgId, text);
  };

  const selectedImagesContent = useMemo(() => {
    return selectedImages.map((imgId) => {
      const imgData = imagesArray.find((img) => img.id === imgId);
      if (!imgData) return null; // Skip if image data is not found

      return (
        <TouchableOpacity
          key={imgData.id}
          style={playerNameStyles.selectedImageContainer}
          onPress={() => handleSelectedImageClick(imgData.id)}
        >
          <Image
            source={imgData.image}
            style={playerNameStyles.selectedImage}
          />
          <TextInput
            style={playerNameStyles.nameInput}
            placeholder="Enter Name"
            value={imageNames[imgData.id] || ""}
            onChangeText={handleTextChange(imgData.id)}
            maxLength={10}
          />
        </TouchableOpacity>
      );
    });
  }, [selectedImages, imageNames, handleNameChange, handleSelectedImageClick]);

  return (
    <View style={playerNameStyles.selectedImageGrid}>
      {selectedImages.length > 0 && (
        <Text style={playerNameStyles.selectedImageTitle}>
          Your Superhero Team!
        </Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={playerNameStyles.selectedImageRow}>
          {selectedImagesContent}
        </View>
      </ScrollView>
    </View>
  );
};

export const SelectedImageGrid = memo(SelectedImageGridComponent);
