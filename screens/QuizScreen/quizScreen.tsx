import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";
import { playSound } from "@/redux/reducers/soundReducer";
import { useDispatch } from "react-redux";
import GameTable from "./GameTable";

const NUM_QUESTIONS = 7;
const CORRECT_ANSWER_GIF = 7;
const INCORRECT_ANSWER_GIF = 6;

interface PlayerData {
  image?: string | null;
  message?: string | null;
  imageType?: string | null;
}

const buttons = [
  { id: 1, text: "50-50" },
  { id: 2, text: "Quit" },
  { id: 3, text: "ScoreBoard" },
];

export default function QuizScreen() {
  const { table, getRandomQuestion } = useGameTableAndScores();
  const dispatch = useDispatch();

  const [countdown, setCountdown] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [question, setQuestion] = useState(getRandomQuestion());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">("image");
  const [isTableOpen, setIsTableOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Logic
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
    setIsDynamicPopUp(true);

    if (answer === question?.correctAnswer) {
      dispatch(playSound("win"));
      setMediaType("gif");
      setMediaId(CORRECT_ANSWER_GIF);
      setIsCorrect(true);
    } else {
      dispatch(playSound("lose"));
      setIsCorrect(false);
      setMediaType("gif");
      setMediaId(INCORRECT_ANSWER_GIF);
    }

    setTimeout(() => {
      setIsDynamicPopUp(false);
    }, 5000);
  };

  const handleNextQuestion = () => {
    if (questionIndex + 1 === NUM_QUESTIONS) {
      Alert.alert("Game Over!", "You've answered all questions.");
      resetGame();
    } else {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setQuestion(getRandomQuestion());
      setQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const resetGame = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuestion(getRandomQuestion());
  };

  return (
    <>
      {isTableOpen && <GameTable isTableOpen={isTableOpen} setIsTableOpen={setIsTableOpen} table={table} />}

      {isDynamicPopUp ? (
        <ImageBackground
          source={require("../../assets/images/bg/quizbg2.png")}
          style={styles.backgroundImage}
        >
          <DynamicOverlayPopUp
            isPopUp={isDynamicPopUp}
            mediaId={mediaId}
            mediaType={mediaType}
            closeVisibleDelay={3000}
          />
        </ImageBackground>
      ) : (
        <ImageBackground
          source={require("../../assets/images/bg/quizbg2.png")}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Timer Countdown */}
            <View style={styles.playersSection}>
              <ImageBackground
                source={require("../../assets/images/bg/timer.png")}
                style={styles.vsCircle}
                imageStyle={styles.vsCircleImage}
              >
                <Text style={styles.vsText}>{countdown}</Text>
              </ImageBackground>
            </View>

            {/* New Circular Section */}
            <View style={styles.circularSection}>
              <ImageBackground
                source={require("../../assets/images/bg/quizbg5.png")}
                style={styles.circularBackground}
                imageStyle={styles.circularBackgroundImage}
              />
            </View>

            {/* Question Section */}
            <View style={styles.questionSection}>
              <ImageBackground
                source={require("../../assets/images/bg/quiz3.png")}
                style={styles.questionBackground}
                imageStyle={styles.questionBackgroundImage}
              >
                <Text style={styles.questionText}>{question?.question}</Text>
              </ImageBackground>
            </View>

            {/* Options Section */}
            <View style={styles.optionsSection}>
              {question?.options?.map((option, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleAnswerSelection(option)}
                  style={styles.optionWrapper}
                  accessible
                  accessibilityLabel={`Option ${index + 1}: ${option}`}
                >
                  <ImageBackground
                    source={require("../../assets/images/bg/quiz3.png")}
                    style={styles.optionBackground}
                    imageStyle={styles.optionBackgroundImage}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </ImageBackground>
                </Pressable>
              ))}
            </View>

            {/* Buttons Section */}
            <View style={styles.buttonsSection}>
              {buttons.map((button) => (
                <ImageBackground
                  key={button.id}
                  source={require("../../assets/images/bg/quiz3.png")}
                  style={styles.iconBackground}
                  imageStyle={styles.iconBackgroundImage}
                >
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      if (button.text === "ScoreBoard") {
                        setIsTableOpen(true);
                      }
                    }}
                    accessible
                    accessibilityLabel={button.text}
                  >
                    <Text style={styles.iconText}>{button.text}</Text>
                  </TouchableOpacity>
                </ImageBackground>
              ))}
            </View>
          </ScrollView>
        </ImageBackground>
      )}
    </>
  );
}
