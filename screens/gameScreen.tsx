import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";

export default function GameScreen() {
  const {
    table,
    totalScores,
    getSpecificRoundScore,
    getTotalScoreUpToRound,
    getScoreQuestion,
    getTotalScoreQuestion,
    getOperationQuestion,
    getTrueFalseQuestion,
    getRoundOffQuestion,
    getRandomPositionQuestion,
    getPlayerPositionBooleanQuestion,
    getDivisibilityQuestion,
    getRandomQuestion

  } = useGameTableAndScores("hard");

  const roundIndex = 6; // Example: up to round 3 (0-based index)
  const player = "Police"; // Example: Police player
  const operation = "+"; // Example: Addition

 

  if (table.length <= 1) {
    return <Text>Loading...</Text>;
  }
    const question = getRandomQuestion()
    


  return (
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
        <Text style={{ fontSize: 18, marginBottom: 20 }}>
          {question.question}
        </Text>
        {question.options?.map((option) => (
          <TouchableOpacity
            key={option}
            style={{
              padding: 10,
              backgroundColor: "#4CAF50",
              marginBottom: 10,
              borderRadius: 5,
            }}
            onPress={() => alert(`You selected: ${option}`)}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>{option}</Text>
          </TouchableOpacity>
        ))}
        <Text style={{ fontSize: 16, marginTop: 20 }}>
          Correct Answer: {question.correctAnswer}
        </Text>
      </View>

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  row: { flexDirection: "row", marginBottom: 5 },
  cell: { flex: 1, textAlign: "center", padding: 5, borderWidth: 1 },
  score: { fontSize: 16, marginVertical: 5 },
  steps: { fontSize: 14, marginVertical: 5, color: "gray" },
});
