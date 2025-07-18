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
import { useSelector } from "react-redux"; // Import useSelector
import { RootState } from "@/redux/store";

interface SelectedImageGridProps {
  selectedImages: number[];
  imageNames: Record<number, string>;
  handleNameChange: (imageId: number, name: string) => void;
  handleSelectedImageClick: (imageId: number) => void;
  gameMode?: string; // Optional gameMode prop
}

// Helper function to get the correct image source
const getImageSource = (imageData: { type: string; src: any }) => {
  return imageData.type === "local" ? imageData.src : { uri: imageData.src };
};

// SelectedImageGridComponent
const SelectedImageGridComponent: React.FC<SelectedImageGridProps> = ({
  selectedImages,
  imageNames,
  handleNameChange,
  handleSelectedImageClick,
  gameMode,
}) => {
  // Fetch playerImages from Redux store
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );
  // Create imagesArray from Redux data
  const imagesArray = useMemo(() => {
    return Object.entries(playerImages).map(([key, image]) => ({
      id: Number(key),
      // Use the getImageSource helper function to handle image sources
      image: getImageSource(image),
    }));
  }, [playerImages]);

  const handleTextChange = (imgId: number) => (text: string) => {
    handleNameChange(imgId, text);
  };

  const filteredSelectedImages = useMemo(() => {
    if (gameMode === "ONLINE_WITH_BOTS") {
      return selectedImages.length > 0 ? [selectedImages[0]] : [];
    }
    return selectedImages;
  }, [selectedImages, gameMode]);

  const titleText = gameMode === "ONLINE_WITH_BOTS" ? "Your Avatar!" : "Your Superhero Team!";


  const selectedImagesContent = useMemo(() => {
    return filteredSelectedImages.map((imgId) => {
      const imgData = imagesArray.find((img) => img.id === imgId);
      if (!imgData) return null; // Skip if image data is not found
      return (
        <TouchableOpacity
          key={imgData.id}
          style={playerNameStyles.selectedImageContainer}
          onPress={() => handleSelectedImageClick(imgData.id)}
        >
          <Image
            source={imgData.image} // Use the handled image source
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
  }, [
    filteredSelectedImages,
    selectedImages,
    imageNames,
    handleNameChange,
    handleSelectedImageClick,
    imagesArray,
  ]);

  return (
    <View style={playerNameStyles.selectedImageGrid}>
    {filteredSelectedImages.length > 0 && (
      <Text style={playerNameStyles.selectedImageTitle}>
        {titleText}
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
