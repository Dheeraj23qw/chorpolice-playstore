import React, { useMemo, memo } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { playerNameStyles } from '@/screens/playerNameScreen/playerNameCss';
import { playerImages } from '@/constants/playerData';

interface SelectedImageGridProps {
  selectedImages: number[];
  imageNames: Record<number, string>;
  handleNameChange: (imageId: number, name: string) => void;
  handleSelectedImageClick: (imageId: number) => void;
}

const SelectedImageGridComponent: React.FC<SelectedImageGridProps> = ({
  selectedImages,
  imageNames,
  handleNameChange,
  handleSelectedImageClick
}) => {
  const handleTextChange = (imgId: number) => (text: string) => {
    handleNameChange(imgId, text);
  };

  const selectedImagesContent = useMemo(() => {
    return selectedImages.map(imgId => {
      const imgSrc = playerImages[imgId];
      return imgSrc ? (
        <TouchableOpacity
          key={imgId}
          style={playerNameStyles.selectedImageContainer}
          onPress={() => handleSelectedImageClick(imgId)}
        >
          <Image source={imgSrc} style={playerNameStyles.selectedImage} />
          <TextInput
            style={playerNameStyles.nameInput}
            placeholder="Enter Name"
            value={imageNames[imgId] || ''}
            onChangeText={handleTextChange(imgId)}
            maxLength={10}
          />
        </TouchableOpacity>
      ) : null;
    });
  }, [selectedImages, imageNames, handleNameChange, handleSelectedImageClick]);

  return (
    <View style={playerNameStyles.selectedImageGrid}>
      {selectedImages.length > 0 && (
        <Text style={playerNameStyles.selectedImageTitle}>Your Superhero Team!</Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={playerNameStyles.selectedImageRow}>{selectedImagesContent}</View>
      </ScrollView>
    </View>
  );
};

export const SelectedImageGrid = memo(SelectedImageGridComponent);
