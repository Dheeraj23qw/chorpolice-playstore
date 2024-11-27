import { ImageBackground, Text } from "react-native";
import { styles } from "@/screens/QuizScreen/_styles/quizResultStyles";

interface ResultInfoProps {
  Correct: number;
  Total: number;
  Message: string;
  coinsMessage: string;
  isWinner: boolean;
}

export const ResultInfo: React.FC<ResultInfoProps> = ({
  Correct,
  Total,
  Message,
  coinsMessage,
  isWinner,
}) => (
  <>
    <Text style={styles.heading}>
      {isWinner ? "Congratulations!" : "Nice try!"}
    </Text>
    <Text style={styles.score}>{`Your Score: ${Correct}/${Total}`}</Text>
    <Text style={styles.message}>{Message}</Text>
    <Text style={styles.coinMessage}>{coinsMessage}</Text>
    <ImageBackground
      source={
        isWinner
          ? require("@/assets/images/treasure.png")
          : require("@/assets/images/empty.png")
      }
      style={styles.gif}
      resizeMode="contain"
    />
  </>
);
