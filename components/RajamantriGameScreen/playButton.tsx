import React from "react";
import { Text, Pressable, View, ImageBackground } from "react-native";
import { styles } from "@/screens/RajaMantriGameScreen/styles";

interface PlayButtonProps {
  disabled: boolean;
  onPress: () => void;
  buttonText: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  disabled,
  onPress,
  buttonText,
}) => {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <View style={[styles.playButton, disabled && styles.playButtonDisabled]}>
        <Text style={styles.playButtonText}>{buttonText}</Text>
      </View>
    </Pressable>
  );
};

export default React.memo(PlayButton);
