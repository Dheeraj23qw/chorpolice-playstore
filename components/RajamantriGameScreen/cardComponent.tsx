import React from "react";
import {
  TouchableOpacity,
  Image,
  Animated,
  ImageBackground,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { selectSelectedImages } from "@/redux/selectors/playerDataSelector";
import { RootState } from "@/redux/store";
import { rf } from "@/utils/responsive";
import { Text } from "../Text";

interface PlayerCardProps {
  index: number;
  role: string;
  playerName: string;
  flipped: boolean;
  clicked: boolean;
  onClick: (index: number) => void;
  animatedStyle: any;
  onBounceEffect: (index: number) => void;
}

const roleImages: Record<string, any> = {
  King: require("../../assets/images/chorsipahi/king.png"),
  Advisor: require("../../assets/images/chorsipahi/advisor.png"),
  Thief: require("../../assets/images/chorsipahi/thief.png"),
  Police: require("../../assets/images/chorsipahi/police.png"),
};

const getImageSource = (imageData: { type: string; src: any }) => {
  return imageData.type === "local" ? imageData.src : { uri: imageData.src };
};

const PlayerCard: React.FC<PlayerCardProps> = React.memo(
  ({
    index,
    role,
    playerName,
    flipped,
    clicked,
    onClick,
    animatedStyle,
    onBounceEffect,
  }) => {
    const selectedImages = useSelector(selectSelectedImages);
    const playerImages = useSelector(
      (state: RootState) => state.playerImages.images
    );

    const handleClick = (idx: number) => {
      onBounceEffect(idx);
      onClick(idx);
    };

    const renderContent = () => {
      if (flipped) {
        return (
          <View className="flex-1 items-center justify-center p-3">
            {/* Role Reveal Glow Layer */}
            <View className="absolute inset-0 bg-indigo-500/10 rounded-[26px]" />

            <Image
              source={roleImages[role]}
              className="w-full h-full"
              resizeMode="contain"
            />

            {/* Role Badge */}
            <View className="absolute bottom-3 bg-indigo-950/90 px-4 py-1.5 rounded-full border border-indigo-400/40 shadow-lg">
              <Text className="text-indigo-100 font-main-bold uppercase text-[11px] tracking-[2px] ">
                {role}
              </Text>

              {/* Shine strip */}
              <View className="absolute inset-x-2 top-0 h-[1px] bg-white/40 rounded-full" />
            </View>
          </View>
        );
      }

      const imageIndex = selectedImages[index] ?? index + 1;
      const playerImage = getImageSource(playerImages[imageIndex]);

      return (
        <ImageBackground
          source={playerImage}
          imageStyle={{ borderRadius: 26 }}
          className="flex-1 overflow-hidden"
        >
          {/* Glass Overlay */}
          <View className="flex-1 bg-black/35 justify-end p-3">
            {/* Name HUD */}
            <View className="bg-indigo-950/90 border border-indigo-400/30 rounded-2xl py-2 px-3 items-center shadow-xl">
              <Text
                numberOfLines={1}
                style={{ fontSize: rf(1.25) }}
                className="text-indigo-100 font-main-bold uppercase tracking-wider "
              >
                {playerName}
              </Text>

              {/* Shine line */}
              <View className="absolute top-0 left-2 right-2 h-[1px] bg-white/30 rounded-full" />
            </View>
          </View>
        </ImageBackground>
      );
    };

    return (
      <TouchableOpacity
        onPress={() => handleClick(index)}
        disabled={flipped || clicked}
        activeOpacity={0.92}
        className="flex-1 aspect-[3/4]"
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              // Slab Depth
              borderBottomWidth: flipped ? 1 : 6,
              borderRightWidth: 1,
              borderBottomColor: flipped
                ? "rgba(255,255,255,0.08)"
                : "#1e1b4b",
              borderRightColor: "rgba(255,255,255,0.12)",
            },
          ]}
          className={`flex-1 rounded-[30px] overflow-hidden border-t border-l ${
            flipped
              ? "bg-[#050507] border-white/25"
              : "bg-[#0b0b12] border-white/10"
          } ${clicked && !flipped ? "opacity-40" : "opacity-100"}`}
        >
          {/* 🌟 Base Gloss Gradient */}
          <View className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40" />

          {/* 🌟 Inner Glow Border */}
          <View className="absolute inset-[1px] rounded-[28px] border border-indigo-400/20" />

          {/* 🌟 Top Reflection Strip */}
          {!flipped && (
            <View className="absolute top-0 left-0 right-0 h-10 bg-white/10" />
          )}

          {renderContent()}

          {/* 🌟 Corner Status Gem */}
          {!flipped && (
            <View className="absolute top-3 right-3">
              <View className="w-3 h-3 rounded-full bg-indigo-400 shadow-lg" />
              <View className="absolute inset-0 rounded-full border border-white/40" />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

export default PlayerCard;
