import React, { useEffect, useState } from "react";
import { View, ImageBackground, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";

import { styles } from "@/screens/QuizScreen/_styles/quizResultStyles";
import useRandomMessage from "@/hooks/useRandomMessage";
import CustomRatingModal from "@/modal/RatingModal";
import { RootState } from "@/redux/store";
import { resetDifficulty } from "@/redux/reducers/quiz";
import { handleShare } from "@/utils/share";
import { addCoins, resetCoins } from "@/redux/reducers/coinsReducer";
import { ResultInfo } from "./components/reseltInfo";
import { RenderButtons } from "./components/renderButtons";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";

export default function QuizResult() {
  const [modalVisible, setModalVisible] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState<string>("");
  const [coinsAwardedOnce, setCoinsAwardedOnce] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
    level,
  } = useSelector((state: RootState) => state.difficulty);

  const Message = useRandomMessage("a", isWinner ? "winner" : "loser");

  useEffect(() => {
    if (isWinner && !coinsAwardedOnce) {
      console.log("called");
      let message = "";
      switch (level) {
        case "easy":
          dispatch(addCoins(100));
          message = "You won 100 coins!";
          break;
        case "medium":
          dispatch(addCoins(500));
          message = "You won 500 coins!";
          break;
        case "hard":
          dispatch(addCoins(2000));
          message = "You won 2000 coins!";
          break;
        default:
          message = "";
          break;
      }
      setCoinsAwarded(message);
      setCoinsAwardedOnce(true); // Lock the effect
    }
  }, []);

  // Clean up modal visibility to avoid memory leaks
  useEffect(() => {
    return () => {
      setModalVisible(false);
    };
  }, []);

  // Handlers
  const handleHome = () => {
    router.push("/gamelevel");
  };

  const toggleModal = () => setModalVisible((prev) => !prev);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ResultInfo
            Correct={Correct}
            Total={Total}
            Message={Message}
            coinsMessage={coinsAwarded}
            isWinner={isWinner}
            level={level}
          />
          <RenderButtons
            handleShare={handleShare}
            handleHome={handleHome}
            toggleModal={toggleModal}
          />
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
