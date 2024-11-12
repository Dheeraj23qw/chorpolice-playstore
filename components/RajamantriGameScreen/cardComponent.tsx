import React, { useEffect, useState } from "react";
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
  roles: string[];
  policeIndex: number | null;
  advisorIndex: number | null;
  thiefIndex: number | null;
  kingIndex: number | null;
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
  ({
    index,
    role,
    playerName,
    flipped,
    clicked,
    onClick,
    animatedStyle,
    policeIndex,
    advisorIndex,
    thiefIndex,
  }) => {
    const selectedImages = useSelector(selectSelectedImages);
    const playerImages = useSelector(
      (state: RootState) => state.playerImages.images
    );

    const playerData = useSelector((state: RootState) => state.player);
    const botIndexes = playerData.playerNames
      .map((player, idx) => (player.isBot ? idx : -1))
      .filter((idx) => idx !== -1);

    const isPoliceBot =
      policeIndex !== null && botIndexes.includes(policeIndex);

    const handleClick = (idx: number) => {
      // Allow click only if the current police is not a bot
      if (!isPoliceBot) {
        onClick(idx);
      }
    };

    // Automatic response for bots with "Advisor" or "Thief" role
    useEffect(() => {
      if (botIndexes.includes(index)) {
        // Bot action with a random delay for Advisor or Thief
        if (role === "Advisor" || role === "Thief") {
          const timeout = setTimeout(() => {}, Math.random() * 2000 + 6000); // Random delay between 6 to 8 seconds

          return () => clearTimeout(timeout);
        }

        // For Police bot
        if (role === "Police") {
          const targetIndex = advisorIndex !== null ? advisorIndex : thiefIndex;
          if (targetIndex !== null) {
            const timeout = setTimeout(() => {
              onClick(targetIndex); // Automatically send the index of Advisor or Thief
            }, Math.random() * 2000 + 6000); // Random delay between 1 to 3 seconds

            return () => clearTimeout(timeout);
          }
        }
      }
    }, [
      flipped,
      botIndexes,
      index,
      role,
      advisorIndex,
      thiefIndex,
      handleClick,
    ]);

    const renderContent = () => {
      if (flipped) {
        if (role === "Police" || role === "King") {
          return <Image source={roleImages[role]} style={styles.cardImage} />;
        } else {
          return (
            <TouchableOpacity onPress={() => handleClick(index)}>
              <Image source={roleImages[role]} style={styles.cardImage} />
            </TouchableOpacity>
          );
        }
      } else {
        // When not flipped, show the player's image and name
        const playerImage = selectedImages[index]
          ? getImageSource(playerImages[selectedImages[index]])
          : getImageSource(playerImages[index + 1]);

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
      }
    };

    return (
      <TouchableOpacity
        onPress={() => handleClick(index)}
        disabled={flipped || clicked || botIndexes.includes(index)}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

export default PlayerCard;
