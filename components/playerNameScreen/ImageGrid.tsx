import React, { memo } from "react";
import { Pressable, ScrollView, StyleSheet, View, Image } from "react-native";
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import { playerNameStyles } from "@/screens/playerNameScreen/playerNameCss";
import { RootState } from "@/redux/store";
import { GameMode } from "@/redux/slices/playerSlice";

interface ImageGridProps {
  selectedImages: number[];
  handleImageSelect: (imageId: number,isBot: boolean,gameMode:GameMode) => void;
  isBot: boolean;
  imagesPerRow: number;
  gameMode?:GameMode;
}

// Utility function to split images array into chunks of imagesPerRow size
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
  isBot,
  imagesPerRow,
  gameMode="OFFLINE"
}) => {
  // Fetch playerImages from Redux store
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images
  );



  /* yha pr basically ham store se playerImages ko lae h jisme hmare bydefault player's avtars saved hai chahe wo
   gallary se ho aur chahe assets se wo sare images store hai
   const playerImages: { [key: number]: PlayerImage;  } is format me */

  // yha par ham playerImages object ko array me convert kr rhe hai......
  const imagesArray = Object.entries(playerImages).map(([key, image]) => ({
    id: Number(key),
    image: image.type === "local" ? image.src : { uri: image.src },
  }));

  // Split images into rows with imagesPerRow images each
  const rows = chunkArray(imagesArray, imagesPerRow);

  const handlePress = (imageId: number,isBot:boolean,gameMode:GameMode) => {
    handleImageSelect(imageId,isBot,gameMode); // Directly call the select handler
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
                onPress={() => handlePress(item.id,isBot,gameMode)}
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
