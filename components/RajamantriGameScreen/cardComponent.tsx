import React, { memo } from "react";
import {
  TouchableOpacity,
  Image,
  Animated,
  ImageBackground,
  View,
} from "react-native";
import { MotiView } from "moti";
import { useSelector } from "react-redux";
import { selectSelectedImages } from "@/redux/selectors/playerDataSelector";
import { RootState } from "@/redux/store";
import { rf } from "@/utils/responsive";
import { Text } from "../Text";
import { Ionicons } from "@expo/vector-icons";

interface PlayerCardProps {
  index: number;
  role: string;
  playerName: string;
  flipped: boolean;
  clicked: boolean;
  isCorrect?: boolean; // ✅ NEW (important)
  onClick: (index: number) => void;
  animatedStyle: any;
  onBounceEffect: (index: number) => void;
  isHighlight?: boolean;
}

const roleImages: Record<string, any> = {
  King: require("../../assets/images/chorsipahi/king.webp"),
  Advisor: require("../../assets/images/chorsipahi/advisor.webp"),
  Thief: require("../../assets/images/chorsipahi/thief.webp"),
  Police: require("../../assets/images/chorsipahi/police.webp"),
  Joker: require("../../assets/images/chorsipahi/joker.webp"),
};

const getImageSource = (imageData: { type: string; src: any }) => {
  return imageData.type === "local" ? imageData.src : { uri: imageData.src };
};

const PlayerCard = memo(function PlayerCard({
  index,
  role,
  playerName,
  flipped,
  clicked,
  isCorrect = false, // ✅ default
  onClick,
  animatedStyle,
  onBounceEffect,
  isHighlight = false,
}: PlayerCardProps) {
  const selectedImages = useSelector(selectSelectedImages);
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images,
  );

  const handleClick = (idx: number) => {
    onBounceEffect(idx);
    onClick(idx);
  };

  const renderResultBadge = () => {
    // Show 'SELECTED' if clicked but not yet flipped
    if (clicked && !flipped) {
      return (
        <View className="absolute right-3 top-3 rounded-full border border-yellow-400/50 bg-yellow-500/20 px-3 py-1 shadow-lg z-20">
          <Text className="font-main-bold text-[10px] uppercase tracking-wider text-yellow-300">
            Selected
          </Text>
        </View>
      );
    }
    
    return null;
  };

  const renderContent = () => {
    if (flipped) {
      return (
        <View className="flex-1 items-center justify-center p-3">
          <View className="absolute inset-0 rounded-[26px] bg-indigo-500/10" />

          {/* Player Name Badge */}
          <View className="absolute top-3 w-full items-center z-10">
            <View className="rounded-full border border-indigo-400/30 bg-indigo-950/80 px-3 py-1 shadow-lg">
              <Text numberOfLines={1} className="font-main-bold text-[9px] uppercase tracking-widest text-indigo-200">
                {playerName}
              </Text>
            </View>
          </View>

          {/* Full Card Result Overlay */}
          {clicked && (
            <View 
              className={`absolute inset-0 z-0 rounded-[26px] border-4 ${
                isCorrect ? "bg-green-500/20 border-green-500/60" : "bg-red-500/20 border-red-500/60"
              }`} 
            />
          )}

          <Image
            source={roleImages[role]}
            className="h-full w-full z-10"
            resizeMode="contain"
          />

          <View className="absolute bottom-3 rounded-full border border-indigo-400/40 bg-indigo-950/90 px-4 py-1.5 shadow-lg z-10">
            <Text className="font-main-bold text-[11px] uppercase tracking-[2px] text-indigo-100">
              {role}
            </Text>
            <View className="absolute inset-x-2 top-0 h-[1px] rounded-full bg-white/40" />
          </View>
        </View>
      );
    }

    const imageIndex = selectedImages[index] ?? index + 1;
    const playerImage = getImageSource(playerImages[imageIndex]);
    const cardBackImage = require("../../assets/images/chorsipahi/card.webp");

    return (
      <ImageBackground
        source={isHighlight ? cardBackImage : playerImage}
        imageStyle={{ borderRadius: 26, opacity: isHighlight ? 0.9 : 1 }}
        className="flex-1 overflow-hidden"
      >
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
                backgroundColor: 'rgba(99, 102, 241, 0.15)', 
              }}
              className="absolute inset-0 z-10 border-[4px] border-indigo-500 rounded-[26px] items-center justify-center"
            >
              <View className="rounded-full bg-indigo-500 px-4 py-1.5 shadow-lg shadow-indigo-500/50">
                <Text className="font-main-bold text-[10px] text-white uppercase tracking-widest">Mystery</Text>
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

  return (
    <TouchableOpacity
      onPress={() => handleClick(index)}
      disabled={flipped || clicked}
      activeOpacity={0.92}
      className="flex-1"
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            borderBottomWidth: flipped ? 1 : 6,
            borderRightWidth: 1,
            borderBottomColor: flipped ? "rgba(255,255,255,0.08)" : "#1e1b4b",
            borderRightColor: "rgba(255,255,255,0.12)",
          },
        ]}
        className={`flex-1 overflow-hidden rounded-[30px] border-l border-t ${
          flipped
            ? "border-white/25 bg-[#050507]"
            : "border-white/10 bg-[#0b0b12]"
        } ${clicked && !flipped ? "opacity-40" : "opacity-100"}`}
      >
        {/* background glow */}
        <View className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40" />
        <View className="absolute inset-[1px] rounded-[28px] border border-indigo-400/20" />

        {/* status top bar */}
        {!flipped && (
          <View className="absolute left-0 right-0 top-0 h-10 bg-white/10" />
        )}

        {renderContent()}

        {/* 🔥 RESULT BADGE (NEW) */}
        {renderResultBadge()}

        {/* indicator dot */}
        {!flipped && (
          <View className="absolute right-3 top-3">
            <View className="h-3 w-3 rounded-full bg-indigo-400 shadow-lg" />
            <View className="absolute inset-0 rounded-full border border-white/40" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

PlayerCard.displayName = "PlayerCard";

export default PlayerCard;
