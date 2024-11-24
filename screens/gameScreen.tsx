import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";

interface PlayerData {
  image?: string | null;
  message?: string | null;
  imageType?: string | null;
}

const NUM_QUESTIONS = 7;
const CORRECT_ANSWER_GIF = 7;
const INCORRECT_ANSWER_GIF = 6;

export default function GameScreen() {
  const { table ,getRandomQuestion} = useGameTableAndScores();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [question, setQuestion] = useState(getRandomQuestion());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">("image");

 
   useEffect(() => {
    setQuestion(getRandomQuestion());
  }, []);
  // Handle the answer selection
  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
    setIsDynamicPopUp(true);

    if (answer === question?.correctAnswer) {
      setMediaType("gif");
      setMediaId(CORRECT_ANSWER_GIF);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
      setMediaType("gif");
      setMediaId(INCORRECT_ANSWER_GIF);
    }

    setTimeout(() => {
      setIsDynamicPopUp(false);
    }, 5000);
  };

  // Handle moving to the next question
  const handleNextQuestion = () => {
    if (questionIndex === NUM_QUESTIONS) {
      alert("Game Over!");
      setSelectedAnswer(null);
      setIsCorrect(null);
      setQuestionIndex(0);
    } else {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setQuestion(getRandomQuestion());
      setQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  return (
    <>
      {isDynamicPopUp && (
        <DynamicOverlayPopUp
          isPopUp={isDynamicPopUp}
          mediaId={mediaId}
          mediaType={mediaType}
          closeVisibleDelay={3000}
        />
      )}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Game Table</Text>
        {table.map((row, rowIndex) => (
          <View style={styles.row} key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <Text style={styles.cell} key={cellIndex}>
                {cell}
              </Text>
            ))}
          </View>
        ))}

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.questionText}>{question?.question}</Text>

          {/* Render options */}
          {question?.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.selectedButton,
                isCorrect === false && option === question.correctAnswer
                  ? styles.correctAnswerButton
                  : {},
              ]}
              onPress={() => handleAnswerSelection(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}

          {/* Show the result after the answer is selected */}
          {selectedAnswer && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>You selected: {selectedAnswer}</Text>
              {isCorrect !== null && (
                <Text style={styles.resultText}>
                  {isCorrect ? "Correct!" : "Incorrect!"}
                </Text>
              )}
              {isCorrect === false && (
                <Text style={styles.resultText}>
                  Correct Answer: {question?.correctAnswer}
                </Text>
              )}

              {/* Display the solution if available */}
              {/* {question?.hint && (
                <View style={styles.solutionContainer}>
                  <Text style={styles.solutionHeader}>Solution:</Text>
                  <Text style={styles.solutionText}>{question?.hint}</Text>
                </View>
              )} */}

              {/* Show next question button */}
              <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
                <Text style={styles.buttonText}>Next Question</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  row: { flexDirection: "row", marginBottom: 5 },
  cell: { flex: 1, textAlign: "center", padding: 5, borderWidth: 1 },
  questionText: { fontSize: 18, marginBottom: 20 },
  optionButton: {
    padding: 10,
    backgroundColor: "#4CAF50",
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: "#8BC34A",
  },
  correctAnswerButton: {
    backgroundColor: "#4CAF50",
  },
  optionText: { color: "#fff", fontSize: 16 },
  resultContainer: { marginTop: 20 },
  resultText: { fontSize: 16 },
  nextButton: {
    padding: 10,
    backgroundColor: "#2196F3",
    marginTop: 20,
    borderRadius: 5,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  solutionContainer: {
    marginTop: 10,
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 5,
  },
  solutionHeader: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  solutionText: { fontSize: 14, color: "#333" },
});
