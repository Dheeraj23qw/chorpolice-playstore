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
import { styles } from "@/screens/RajaMantriGameScreen/styles";
import { selectSelectedImages } from "@/redux/selectors/playerDataSelector";
import { RootState } from "@/redux/store";

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
          <TouchableOpacity
            disabled={role === "Police" || role === "King"}
            onPress={() => handleClick(index)}
          >
            <Image source={roleImages[role]} style={styles.cardImage} />
          </TouchableOpacity>
        );
      }

      const imageIndex = selectedImages[index] ?? index + 1;
      const playerImage = getImageSource(playerImages[imageIndex]);

      return (
        <ImageBackground
          source={playerImage}
          style={styles.playerNmaeCardImage}
        >
          <View style={styles.overlay}>
            <TouchableOpacity onPress={() => handleClick(index)}>
              <Text style={styles.cardText}>{playerName}</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    };

    return (
      <TouchableOpacity
        onPress={() => handleClick(index)}
        disabled={flipped || clicked}
        activeOpacity={0.85}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

export default PlayerCard;
