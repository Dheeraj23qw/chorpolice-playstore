import React, { useEffect, useState } from "react";
import { View, ImageBackground, ScrollView, StatusBar, Animated } from "react-native";
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
import { playSound } from "@/redux/reducers/soundReducer";

export default function QuizResult() {
  const [modalVisible, setModalVisible] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState<string>("");
  const [coinsAwardedOnce, setCoinsAwardedOnce] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // For fade-in animation
  const [scaleAnim] = useState(new Animated.Value(0.8)); // For scale animation

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
    if (!coinsAwardedOnce && level != null) {
      // Check if coins have already been awarded
      const coinValues = {
        easy: isWinner ? 100 : 10,
        medium: isWinner ? 500 : 25,
        hard: isWinner ? 2000 : 50,
      };
      const levelMessage = isWinner
        ? `You won ${coinValues[level]} coins!`
        : `You won ${coinValues[level]} coins for participating!`;

      dispatch(addCoins(coinValues[level])); // Award coins to the player
      setCoinsAwarded(levelMessage);
      setCoinsAwardedOnce(true); // Lock the effect
    }
  }, [coinsAwardedOnce, level, isWinner, dispatch]);

  // Animation effect for fade and scale
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 2,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Clean up modal visibility to avoid memory leaks
  useEffect(() => {
    return () => {
      setModalVisible(false);
    };
  }, []);

  // Handlers
  const handleHome = () => {
    dispatch(playSound("quiz"));
    router.push("/modeselect");
  };

  const toggleModal = () => setModalVisible((prev) => !prev);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <StatusBar backgroundColor={"transparent"} />

        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ResultInfo
            Correct={Correct}
            Total={Total}
            Message={Message}
            coinsMessage={coinsAwarded}
            isWinner={isWinner}
          />
          <RenderButtons
            handleShare={handleShare}
            handleHome={handleHome}
            toggleModal={toggleModal}
          />
        </Animated.View>
        
        <CustomRatingModal
          visible={modalVisible}
          onClose={toggleModal}
          title="Enjoying the App?"
        />
      </ImageBackground>
    </ScrollView>
  );
}
