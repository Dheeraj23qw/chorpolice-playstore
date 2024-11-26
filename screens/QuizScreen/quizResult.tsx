import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  Pressable,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";

import { styles } from "@/screens/QuizScreen/_styles/quizResultStyles";
import useRandomMessage from "@/hooks/useRandomMessage";
import CustomRatingModal from "@/modal/RatingModal";
import { RootState } from "@/redux/store";
import { resetDifficulty } from "@/redux/reducers/quiz";
import { handleShare } from "@/utils/share";

export default function QuizResult() {
  const [modalVisible, setModalVisible] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const { correctQuestions: Correct, totalQuestions: Total, isWinner } =
    useSelector((state: RootState) => state.difficulty);

  const Message = useRandomMessage("a", isWinner ? "winner" : "loser");

  // Handlers
  const handleHome = () => {
    router.push("/gamelevel");
    dispatch(resetDifficulty());
  };

  const toggleModal = () => setModalVisible((prev) => !prev);

  // Render reusable UI components
  const renderResultInfo = () => (
    <>
      <Text style={styles.heading}>
        {isWinner ? "Congratulations!" : "Nice try!"}
      </Text>
      <Text style={styles.score}>
        {`Your Score: ${Correct}/${Total}`}
      </Text>
      <Text style={styles.message}>{Message}</Text>
      <Text style={styles.coinMessage}>
        {isWinner
          ? "You won 100 coins!"
          : "You didn’t win coins, but you gained experience!"}
      </Text>
      <ImageBackground
        source={
          isWinner
            ? require("../../assets/images/treasure.png")
            : require("../../assets/images/empty.png")
        }
        style={styles.gif}
        resizeMode="contain"
      />
    </>
  );

  const renderButtons = () => (
    <View style={styles.buttonsContainer}>
      <Pressable style={styles.button} onPress={handleShare}>
        <Text style={styles.buttonText}>Share</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleHome}>
        <Text style={styles.buttonText}>Home</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={toggleModal}>
        <Text style={styles.buttonText}>Rate Us</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {renderResultInfo()}
          {renderButtons()}
        </View>
        <CustomRatingModal
          visible={modalVisible}
          onClose={toggleModal}
          title="Enjoying the App?"
        />
      </ImageBackground>
    </ScrollView>
  );
}
