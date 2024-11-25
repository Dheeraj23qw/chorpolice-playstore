import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { styles } from "@/screens/QuizScreen/_styles/quizResultStyles";
import useRandomMessage from "@/hooks/useRandomMessage";

export default function QuizResult() {
  const [isWinner, setIsWinner] = useState(false); // Change to false for testing losers

  const handleShare = () => {
    console.log("Share button pressed");
  };
  const Message = useRandomMessage("a", isWinner ? "winner" : "loser");

  const handleHome = () => {
    // Handle home button action
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {isWinner ? (
            <>
              <Text style={styles.heading}>Congratulations!</Text>
              <Text style={styles.score}>Your score: 8/10</Text>
              <Text style={styles.message}>{Message}</Text>
              <Text style={styles.coinMessage}>You won 100 coins!</Text>
              <ImageBackground
                source={require("../../assets/images/treasure.png")} // Use your GIF URL here
                style={styles.gif}
                resizeMode="contain"
              />
            </>
          ) : (
            <>    
              <Text style={styles.heading}>Nice try!</Text>
              <Text style={styles.score}>Your score: 4/10</Text>
              <Text style={styles.message}>{Message}</Text>
              <Text style={styles.coinMessage}>
                You didn’t win coins, but you gained experience!
              </Text>
              <ImageBackground
                source={require("../../assets/images/empty.png")} // Replace with an appropriate image for losers
                style={styles.gif}
                resizeMode="contain"
              />
            </>
          )}

          <View style={styles.buttonsContainer}>
            <Pressable style={styles.button} onPress={handleShare}>
              <Text style={styles.buttonText}>Share</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleHome}>
              <Text style={styles.buttonText}>Home</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={handleHome}>
              <Text style={styles.buttonText}>Rate Us</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
}
