import React from "react";
import { ImageBackground, ScrollView, StatusBar, View } from "react-native";
import { styles } from "./styles"; // Import your styles here
import CustomButton from "@/components/CustomButton";
import PlayButton from "@/components/RajamantriGameScreen/playButton";
import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/qiuzStyle";

interface GamePlaySectionProps {
  isPlayButtonDisabled: boolean;
  handlePlay: () => void;
  roles: string[];
  playerNames: string[];
  flippedStates: boolean[];
  clickedCards: boolean[];
  handleCardClick: (index: number) => void;
  handleCardClickWithBounce: (index: number) => void;
  policeIndex: number | null;
  kingIndex: number | null;
  advisorIndex: number | null;
  thiefIndex: number | null;
  toggleModal: () => void;
  round: number;
  message: string | null;
  getCardStyle: (index: number) => any; 
}

export const GamePlaySection: React.FC<GamePlaySectionProps> = ({
  isPlayButtonDisabled,
  handlePlay,
  roles,
  playerNames,
  flippedStates,
  clickedCards,
  handleCardClick,
  handleCardClickWithBounce,
  toggleModal,
  round,
  message,
  getCardStyle
}) => {

  
   return (
    <ImageBackground
      source={require("../../assets/images/bg/quiz.png")}
      style={chorPoliceQuizstyles.imageBackground}
      resizeMode="cover"
    >
      <StatusBar backgroundColor={"transparent"} />

      <View style={chorPoliceQuizstyles.overlay} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <PlayButton
          disabled={isPlayButtonDisabled}
          onPress={handlePlay}
          buttonText={
            isPlayButtonDisabled
              ? message
                ? message
                : `Round ${round}`
              : `Press me to play!`
          }
        />

        <View style={styles.cardRow}>
          {roles.slice(0, 2).map((_, index) => (
            <PlayerCard
              key={index}
              index={index}
              role={roles[index]}
              playerName={playerNames[index]}
              flipped={flippedStates[index]}
              clicked={clickedCards[index]}
              onClick={handleCardClick}
              onBounceEffect={() => handleCardClickWithBounce(index)} // new handler
              animatedStyle={getCardStyle(index)}
            />
          ))}
        </View>
        <View style={styles.cardRow}>
          {roles.slice(2).map((_, index) => (
            <PlayerCard
              key={index + 2}
              index={index + 2}
              role={roles[index + 2]}
              playerName={playerNames[index + 2]}
              flipped={flippedStates[index + 2]}
              clicked={clickedCards[index + 2]}
              onClick={handleCardClick}
              onBounceEffect={() => handleCardClickWithBounce(index + 2)} // new handler
              animatedStyle={getCardStyle(index + 2)}
            />
          ))}
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CustomButton label="Scoreboard" onPress={toggleModal} />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};