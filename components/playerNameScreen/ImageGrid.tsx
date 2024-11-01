import React, { memo } from "react";
import { Pressable, ScrollView, StyleSheet, View, Image } from "react-native";
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import { playerNameStyles } from "@/screens/playerNameScreen/playerNameCss";
import { RootState } from "@/redux/store";

interface ImageGridProps {
  selectedImages: number[];
  handleImageSelect: (imageId: number) => void;
}

// Utility function to split images array into chunks of 12
const chunkArray = (array: any[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const ImageGridComponent: React.FC<ImageGridProps> = ({
  selectedImages,
  handleImageSelect,
}) => {
  // Fetch playerImages from Redux store
  const playerImages = useSelector((state: RootState) => state.playerImages.images); // Adjust the path according to your state shape

  // Transforming the playerImages into an array format
  const imagesArray = Object.entries(playerImages).map(([key, image]) => ({
    id: Number(key),
    image: image.type === "local" ? image.src : { uri: image.src },
  }));

  // Split images into rows with 12 images each
  const rows = chunkArray(imagesArray, 12);

  const handlePress = (imageId: number) => {
    handleImageSelect(imageId); // Directly call the select handler
  };

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <ScrollView
          key={`row-${rowIndex}`} // Unique key for each row
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContainer}
        >
          {row.map((item) => {
            const isSelected = selectedImages.includes(item.id);
            return (
              <Pressable
                key={`row-${rowIndex}-image-${item.id}`} // Unique key combining rowIndex and item.id
                onPress={() => handlePress(item.id)}
                style={[
                  playerNameStyles.imageContainer,
                  isSelected && styles.selectedImageContainer,
                ]}
              >
                <Image
                  source={item.image}
                  style={playerNameStyles.image} // Using standard Image instead of Animated.Image
                />
              </Pressable>
            );
          })}
        </ScrollView>
      ))}
    </View>
  );
};

export const ImageGrid = memo(ImageGridComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedImageContainer: {
    alignItems: "center",
    marginHorizontal: 5,
  },
});
