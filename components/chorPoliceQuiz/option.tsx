import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { rf } from "@/utils/responsive";
import { Text } from "@/components/Text";

type PlayerImage = { type: string; src: any };

type QuizOptionsProps = {
  playerName: string;
  playerImage?: PlayerImage;
  questionNumber: number;
  totalQuestions: number;
  options: number[];
  onOptionPress: (score: number) => void;
  isActivePlayer: boolean;
  hasGuessed?: boolean;
  isTargetPlayer?: boolean;
};

const getImageSource = (image?: PlayerImage): ImageSourcePropType | undefined => {
  if (!image) return undefined;
  return image.type === "local" ? image.src : { uri: image.src };
};

const QuizOptions: React.FC<QuizOptionsProps> = ({
  playerName,
  playerImage,
  questionNumber,
  totalQuestions,
  options,
  onOptionPress,
  isActivePlayer,
  hasGuessed = false,
  isTargetPlayer = false,
}) => {
  const imageSource = getImageSource(playerImage);
  const canChoose = isActivePlayer && !hasGuessed && !isTargetPlayer;
  const stateMessage = isTargetPlayer
    ? "This is your score. The other players are guessing it."
    : hasGuessed
      ? "Your guess is locked. Waiting for the round result…"
      : "Select the score you think is correct.";

  return (
    <View style={styles.wrapper}>
      <View style={styles.questionCard}>
        <View style={styles.questionCopy}>
          <Text style={styles.questionNumber}>
            QUESTION {questionNumber} OF {totalQuestions}
          </Text>
          <Text style={styles.questionText}>
            Can you guess {playerName}&apos;s score?
          </Text>
          <Text style={styles.questionHelp}>{stateMessage}</Text>
        </View>

        {imageSource && (
          <View style={styles.avatarFrame}>
            <Image source={imageSource} style={styles.avatar} resizeMode="cover" />
          </View>
        )}
      </View>

      <View style={styles.optionsList}>
        {options.length > 0 ? (
          options.map((score, index) => (
            <TouchableOpacity
              key={`${playerName}-${score}-${index}`}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel={`Choose ${score.toLocaleString()} points`}
              accessibilityState={{ disabled: !canChoose }}
              disabled={!canChoose}
              onPress={() => onOptionPress(score)}
              style={[
                styles.optionButton,
                !canChoose && styles.optionButtonDisabled,
              ]}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>{String.fromCharCode(65 + index)}</Text>
              </View>
              <Text style={styles.optionScore}>{score.toLocaleString()}</Text>
              <Text style={styles.pointsLabel}>POINTS</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.loadingOption}>
            <Text style={styles.loadingText}>Preparing score options…</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  questionCard: {
    minHeight: 126,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#4B548E",
    borderRadius: 24,
    backgroundColor: "#171A30",
  },
  questionCopy: {
    flex: 1,
    paddingRight: 12,
  },
  questionNumber: {
    marginBottom: 6,
    fontSize: rf(1.05),
    fontFamily: "main-bold",
    color: "#A5B4FC",
    letterSpacing: 1.6,
  },
  questionText: {
    fontSize: rf(2.2),
    lineHeight: rf(2.7),
    fontFamily: "main-bold",
    color: "#FFFFFF",
  },
  questionHelp: {
    marginTop: 7,
    fontSize: rf(1.15),
    lineHeight: rf(1.55),
    fontFamily: "main-md",
    color: "#C7D2FE",
  },
  avatarFrame: {
    width: 76,
    height: 76,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#818CF8",
    borderRadius: 38,
    backgroundColor: "#252A50",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  optionsList: {
    width: "100%",
  },
  optionButton: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#6676D8",
    borderRadius: 20,
    backgroundColor: "#1A1E38",
  },
  optionButtonDisabled: {
    borderColor: "#3C415F",
    backgroundColor: "#141625",
    opacity: 0.72,
  },
  optionLetter: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#4F46E5",
  },
  optionLetterText: {
    fontSize: rf(1.55),
    fontFamily: "main-bold",
    color: "#FFFFFF",
  },
  optionScore: {
    flex: 1,
    marginLeft: 14,
    fontSize: rf(2.7),
    fontFamily: "main-bold",
    color: "#FFFFFF",
  },
  pointsLabel: {
    fontSize: rf(0.95),
    fontFamily: "main-bold",
    color: "#A5B4FC",
    letterSpacing: 1.1,
  },
  loadingOption: {
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4B548E",
    borderRadius: 20,
    backgroundColor: "#171A30",
  },
  loadingText: {
    fontSize: rf(1.45),
    fontFamily: "main-bold",
    color: "#C7D2FE",
  },
});

export default React.memo(QuizOptions);
