import React, { memo } from "react";
import { ImageBackground, View } from "react-native";
import { MotiView } from "moti";

import { rf } from "@/utils/responsive";

import { Text } from "../../Text";
import { cardBackImage } from "./cardAssets";
import { getImageSource } from "./playerCardUtils";

interface PlayerCardFrontFaceProps {
  index: number;
  playerName: string;
  isHighlight: boolean;
  highlightColor?: string;
  selectedImages: any;
  playerImages: any;
}

const PlayerCardFrontFaceComponent: React.FC<PlayerCardFrontFaceProps> = ({
  index,
  playerName,
  isHighlight,
  highlightColor,
  selectedImages,
  playerImages,
}) => {
  const imageIndex = selectedImages[index] ?? index + 1;
  const playerImage = getImageSource(playerImages[imageIndex]);
  const themeColor = highlightColor || "#6366f1";

  return (
    <ImageBackground
      source={isHighlight ? cardBackImage : playerImage}
      imageStyle={{ borderRadius: 26, opacity: isHighlight ? 0.9 : 1 }}
      className="flex-1 overflow-hidden"
    >
      <View className="absolute left-0 right-0 top-0 h-10 bg-white/10" />

      <View className="flex-1 justify-end bg-black/35 p-3">
        {isHighlight ? (
          <MotiView
            from={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 800,
              loop: true,
            }}
            style={{
              backgroundColor: `${themeColor}25`,
              borderColor: themeColor,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
            className="rounded-[26px] border-[4px]"
          >
            <View className="items-center justify-center">
            <View
              style={{
                backgroundColor: themeColor,
                shadowColor: themeColor,
              }}
              className="h-2 w-12 rounded-full shadow-lg"
            />
            </View>
          </MotiView>
        ) : (
          <View className="items-center rounded-2xl border border-indigo-400/30 bg-indigo-950/90 px-3 py-2 shadow-xl">
            <Text
              numberOfLines={1}
              style={{ fontSize: rf(1.25) }}
              className="font-main-bold uppercase tracking-wider text-indigo-100"
            >
              {playerName}
            </Text>

            <View className="absolute left-2 right-2 top-0 h-[1px] rounded-full bg-white/30" />
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

export const PlayerCardFrontFace = memo(PlayerCardFrontFaceComponent);
