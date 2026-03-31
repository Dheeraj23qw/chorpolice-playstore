import React, { memo } from "react";
import { Pressable, ScrollView, View, Image } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { GameMode } from "@/types/redux/reducers";
import { wp } from "@/utils/responsive";

interface ImageGridProps {
  selectedImages: number[];
  handleImageSelect: (imageId: number, gameMode: GameMode) => void;
  imagesPerRow: number;
  gameMode?: GameMode;
  selectedOption?: string | null;
}

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
  imagesPerRow,
  gameMode = "OFFLINE",
  selectedOption,
}) => {
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images,
  );

  const imagesArray = Object.entries(playerImages).map(([key, image]) => ({
    id: Number(key),
    image: image.type === "local" ? image.src : { uri: image.src },
  }));

  // Metamorphism: Reverse array for specific modes if needed
  const finalImages =
    selectedOption === "player-Avatar"
      ? [...imagesArray].reverse()
      : imagesArray;
  const rows = chunkArray(finalImages, imagesPerRow);

  return (
    <View className="flex-1 py-2">
      {rows.map((row, rowIndex) => (
        <ScrollView
          key={`row-${rowIndex}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 15 }}
        >
          {row.map((item) => {
            const isSelected = selectedImages.includes(item.id);
            return (
              <Pressable
                key={`img-${item.id}`}
                onPress={() => handleImageSelect(item.id, gameMode)}
                // Metamorphism styling for the avatar frames
                className={`mr-4 items-center justify-center rounded-full p-1 ${
                  isSelected
                    ? "border-2 border-indigo-400 bg-indigo-500/20"
                    : "border border-white/10 bg-white/5"
                } `}
                style={{
                  width: wp(20),
                  height: wp(20),
                  shadowColor: isSelected ? "#6366f1" : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <Image
                  source={item.image}
                  style={{ width: "90%", height: "90%", borderRadius: 999 }}
                  className={`${isSelected ? "opacity-100" : "opacity-80"}`}
                  resizeMode="cover"
                />

                {/* Specular Shine Overlay */}
                <View className="absolute left-4 right-4 top-1 h-[1px] rounded-full bg-white/20" />
              </Pressable>
            );
          })}
        </ScrollView>
      ))}
    </View>
  );
};

export const ImageGrid = memo(ImageGridComponent);
