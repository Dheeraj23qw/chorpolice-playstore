import React from "react";
import { Text, TouchableOpacity, Image, Animated, ImageBackground, View } from "react-native";
import { useSelector } from "react-redux";
import { styles } from "@/screens/RajaMantriGameScreen/styles";
import { playerImages } from "@/constants/playerData";
import { selectSelectedImages } from "@/redux/slices/selectors";

interface PlayerCardProps {
  index: number;
  role: string;
  playerName: string;
  flipped: boolean;
  clicked: boolean;
  onClick: (index: number) => void;
  animatedStyle: any;
}

const roleImages: { [key: string]: any } = {
  King: require("../../assets/images/chorsipahi/king.png"),
  Advisor: require("../../assets/images/chorsipahi/advisor.png"),
  Thief: require("../../assets/images/chorsipahi/thief.png"),
  Police: require("../../assets/images/chorsipahi/police.png"),
};

const PlayerCard: React.FC<PlayerCardProps> = React.memo(({
  index,
  role,
  playerName,
  flipped,
  clicked,
  onClick,
  animatedStyle,
}) => {
  const selectedImages = useSelector(selectSelectedImages);

  const renderContent = () => {
    if (flipped) {
      if (role === "Police") {
        return <Image source={roleImages.Police} style={styles.cardImage} />;
      } else {
        return (
          <TouchableOpacity onPress={() => onClick(index)}>
            <Image source={roleImages[role]} style={styles.cardImage} />
          </TouchableOpacity>
        );
      }
    } else {
      const playerImage = selectedImages[index] ? playerImages[selectedImages[index]] : playerImages[index + 1];
      return (
        <ImageBackground source={playerImage} style={styles.playerNmaeCardImage}>
          <View style={styles.overlay}>
            <TouchableOpacity onPress={() => onClick(index)}>
              <Text style={styles.cardText}>{playerName}</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    }
  };

  return (
    <TouchableOpacity onPress={() => onClick(index)} disabled={flipped || clicked}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {renderContent()}
      </Animated.View>
    </TouchableOpacity>
  );
});

export default PlayerCard;
