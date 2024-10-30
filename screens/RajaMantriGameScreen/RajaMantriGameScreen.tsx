import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  BackHandler,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { styles } from "./styles";
import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
import PlayButton from "@/components/RajamantriGameScreen/playButton";
import ScoreTable from "@/components/RajamantriGameScreen/scoretable";
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";
import VideoPlayerComponent from "@/components/RajamantriGameScreen/videoPlayer";
import { selectPlayerNames } from "@/redux/slices/selectors";

import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";

const RajaMantriGameScreen: React.FC = () => {
  const playerNames = useSelector(selectPlayerNames).map(
    (player) => player.name
  );

  const {
    flipAnims,
    flippedStates,
    clickedCards,
    message,
    roles,
    isPlayButtonDisabled,
    playerScores,
    round,
    videoIndex,
    isPlaying,
    handlePlay,
    setIsPlaying,
    handleCardClick,
  } = useRajaMantriGame({ playerNames });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#8E5DE9" barStyle="dark-content" />
      {isPlaying ? (
        <VideoPlayerComponent
          videoIndex={videoIndex}
          onVideoEnd={() => setIsPlaying(false)}
        />
      ) : (
        <>
        
        
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
                {/* Overlay */}
         
          <ImageBackground
            source={require("../../assets/images/bg/quiz.png")}
            style={chorPoliceQuizstyles.imageBackground}
            resizeMode="cover"
          >
             <View style={chorPoliceQuizstyles.overlay} />
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
                    playerName={playerNames[index] || "Player"}
                    flipped={flippedStates[index]}
                    clicked={clickedCards[index]}
                    onClick={handleCardClick}
                    animatedStyle={{
                      transform: [
                        {
                          rotateY: flipAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "7200deg"],
                          }),
                        },
                      ],
                    }}
                  />
                ))}
              </View>
              <View style={styles.cardRow}>
                {roles.slice(2).map((_, index) => (
                  <PlayerCard
                    key={index + 2}
                    index={index + 2}
                    role={roles[index + 2]}
                    playerName={playerNames[index + 2] || "Player"}
                    flipped={flippedStates[index + 2]}
                    clicked={clickedCards[index + 2]}
                    onClick={handleCardClick}
                    animatedStyle={{
                      transform: [
                        {
                          rotateY: flipAnims[index + 2].interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "7200deg"],
                          }),
                        },
                      ],
                    }}
                  />
                ))}
              </View>
              </ImageBackground>
              <View style={styles.scrollView}>
                <ScoreTable
                  playerNames={playerNames}
                  playerScores={playerScores}
                />
              </View>

            </ScrollView>
       
        </>
      )}
    </SafeAreaView>
  );
};

export default React.memo(RajaMantriGameScreen);
