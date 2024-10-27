import React from "react";
import { View, Text } from "react-native";
import { styles } from "@/screens/RajaMantriGameScreen/styles";

interface GameMessageProps {
  message: string;
}

const GameMessage: React.FC<GameMessageProps> = React.memo(({ message }) => {
  return (
    <View>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
});

export default GameMessage;
