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
import { selectSelectedImages } from "@/redux/slices/selectors";
import { RootState } from "@/redux/store";

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

const getImageSource = (imageData: { type: string; src: any }) => {
  return imageData.type === "local" ? imageData.src : { uri: imageData.src };
};

const PlayerCard: React.FC<PlayerCardProps> = React.memo(
  ({ index, role, playerName, flipped, clicked, onClick, animatedStyle }) => {
    const selectedImages = useSelector(selectSelectedImages);
    const playerImages = useSelector((state: RootState) => state.playerImages.images); // Adjust the path according to your state shape

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
        const playerImage = selectedImages[index]
          ? getImageSource(playerImages[selectedImages[index]])
          : getImageSource(playerImages[index + 1]);

        return (
          <ImageBackground
            source={playerImage}
            style={styles.playerNmaeCardImage}
          >
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
      <TouchableOpacity
        onPress={() => onClick(index)}
        disabled={flipped || clicked}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

export default PlayerCard;
