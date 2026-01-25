import React from "react";
import {
  Text,
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
    const playerImages = useSelector((state: RootState) => state.playerImages.images);

    const handleClick = (idx: number) => {
      onBounceEffect(idx);
      onClick(idx);
    };

    const renderContent = () => {
      if (flipped) {
        return (
          <View className="flex-1 items-center justify-center p-2">
            {/* Role Reveal State */}
            <View className="absolute inset-0 bg-indigo-500/10 rounded-[24px]" />
            <Image 
              source={roleImages[role]} 
              className="w-full h-full rounded-[20px]" 
              resizeMode="contain" 
            />
            <View className="absolute bottom-2 bg-black/60 px-3 py-1 rounded-full border border-indigo-500/30">
              <Text className="text-white font-black uppercase text-[10px] tracking-widest italic">
                {role}
              </Text>
            </View>
          </View>
        );
      }

      const imageIndex = selectedImages[index] ?? index + 1;
      const playerImage = getImageSource(playerImages[imageIndex]);

      return (
        <ImageBackground
          source={playerImage}
          imageStyle={{ borderRadius: 24 }}
          className="flex-1 overflow-hidden"
        >
          {/* Glass Overlay with Player Name HUD */}
          <View className="flex-1 bg-black/40 justify-end p-3">
             <View className="bg-indigo-900/80 border border-white/20 rounded-xl py-2 px-1 items-center">
                <Text 
                   numberOfLines={1}
                   style={{ fontSize: rf(1.2) }}
                   className="text-white font-black uppercase tracking-tighter italic"
                >
                  {playerName}
                </Text>
             </View>
          </View>
        </ImageBackground>
      );
    };

    return (
      <TouchableOpacity
        onPress={() => handleClick(index)}
        disabled={flipped || clicked}
        activeOpacity={0.9}
        className="flex-1 aspect-[3/4]"
      >
        <Animated.View 
          style={[
            animatedStyle,
            {
                // Physical Slab Depth
                borderBottomWidth: flipped ? 1 : 5,
                borderRightWidth: 1,
                borderBottomColor: flipped ? 'rgba(255,255,255,0.1)' : '#312e81',
                borderRightColor: 'rgba(255,255,255,0.1)',
            }
          ]}
          className={`flex-1 rounded-[28px] border-t border-l ${
            flipped 
              ? "bg-[#08080a] border-white/30" 
              : "bg-[#111118] border-white/10"
          } ${clicked && !flipped ? "opacity-40" : "opacity-100"}`}
        >
          {renderContent()}
          
          {/* Corner HUD Detail */}
          {!flipped && (
            <View className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500/50 border border-indigo-400" />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

export default PlayerCard;