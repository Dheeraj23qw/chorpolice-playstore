import React from "react";
import { Image, ImageSourcePropType, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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
};

type ScoreOptionCardProps = {
  index: number;
  score: number;
  disabled: boolean;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getImageSource = (image?: PlayerImage): ImageSourcePropType | undefined => {
  if (!image) return undefined;
  return image.type === "local" ? image.src : { uri: image.src };
};

const ScoreOptionCard = ({ index, score, disabled, onPress }: ScoreOptionCardProps) => {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 260, delay: 180 + index * 85 }}
    >
      <AnimatedPressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Choose ${score.toLocaleString()} points`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 16, stiffness: 240 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 240 });
        }}
        style={pressStyle}
        className={`mb-3 min-h-[76px] flex-row items-center overflow-hidden rounded-3xl border px-4 ${
          disabled
            ? "border-white/10 bg-[#15172A] opacity-60"
            : "border-indigo-300/40 bg-[#1A1D37]"
        }`}
      >
        {!disabled && <View className="absolute inset-0 bg-indigo-400/[0.03]" />}
        <View
          className={`h-11 w-11 items-center justify-center rounded-2xl ${
            disabled ? "bg-white/10" : "bg-indigo-500"
          }`}
        >
          <Text
            style={{ fontSize: rf(1.45) }}
            className="font-main-bold text-white"
          >
            {String.fromCharCode(65 + index)}
          </Text>
        </View>

        <View className="ml-4 flex-1">
          <Text
            style={{ fontSize: rf(2.65) }}
            className="font-main-bold text-white"
          >
            {score.toLocaleString()}
          </Text>
          <Text
            style={{ fontSize: rf(0.9) }}
            className="font-main-bold tracking-[1.5px] text-indigo-200/70"
          >
            POINTS
          </Text>
        </View>

        <View className="h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Ionicons
            name={disabled ? "lock-closed" : "arrow-forward"}
            size={rf(1.8)}
            color={disabled ? "#9CA3AF" : "#C7D2FE"}
          />
        </View>
      </AnimatedPressable>
    </MotiView>
  );
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
}) => {
  const imageSource = getImageSource(playerImage);
  const canChoose = isActivePlayer && !hasGuessed;
  const status = hasGuessed
    ? { icon: "checkmark-circle" as const, text: "Guess locked — waiting for results" }
    : { icon: "flash" as const, text: "Pick the score before time runs out" };

  return (
    <View className="w-full">
      <MotiView
        key={`question-${questionNumber}`}
        from={{ opacity: 0, scale: 0.96, translateY: 12 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 16, stiffness: 150 }}
        className="mb-5 overflow-hidden rounded-[30px] border border-indigo-300/25 bg-[#15172D]"
      >
        <View className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-indigo-500/20" />
        <View className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-violet-500/10" />

        <View className="flex-row items-center p-5">
          <View className="flex-1 pr-4">
            <View className="mb-2 self-start rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1">
              <Text
                style={{ fontSize: rf(0.95) }}
                className="font-main-bold tracking-[1.5px] text-indigo-200"
              >
                QUESTION {questionNumber} / {totalQuestions}
              </Text>
            </View>
            <Text
              style={{ fontSize: rf(2.35), lineHeight: rf(2.85) }}
              className="font-main-bold text-white"
            >
              Can you guess {playerName}&apos;s score?
            </Text>
            <View className="mt-3 flex-row items-center">
              <Ionicons name={status.icon} size={rf(1.55)} color="#A5B4FC" />
              <Text
                style={{ fontSize: rf(1.05) }}
                className="ml-2 flex-1 font-main-bold text-indigo-100/80"
              >
                {status.text}
              </Text>
            </View>
          </View>

          <View className="items-center">
            <View className="h-[78px] w-[78px] overflow-hidden rounded-[28px] border-2 border-indigo-300/70 bg-indigo-950">
              {imageSource ? (
                <Image source={imageSource} resizeMode="cover" className="h-full w-full" />
              ) : (
                <View className="h-full w-full items-center justify-center">
                  <Ionicons name="person" size={rf(3.2)} color="#C7D2FE" />
                </View>
              )}
            </View>
            <Text
              style={{ fontSize: rf(0.8) }}
              className="mt-1.5 font-main-bold tracking-[1.5px] text-indigo-200"
            >
              TARGET
            </Text>
          </View>
        </View>
      </MotiView>

      <View className="mb-3 flex-row items-center justify-between px-1">
        <Text
          style={{ fontSize: rf(1.02) }}
          className="font-main-bold tracking-[1.8px] text-white/60"
        >
          CHOOSE A SCORE
        </Text>
        <Text
          style={{ fontSize: rf(0.95) }}
          className="font-main-bold text-indigo-300"
        >
          +2,000 TO WIN
        </Text>
      </View>

      {options.length > 0 ? (
        options.map((score, index) => (
          <ScoreOptionCard
            key={`${questionNumber}-${score}-${index}`}
            index={index}
            score={score}
            disabled={!canChoose}
            onPress={() => onOptionPress(score)}
          />
        ))
      ) : (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[76px] items-center justify-center rounded-3xl border border-indigo-300/20 bg-[#15172D]"
        >
          <Ionicons name="sparkles" size={rf(2.1)} color="#A5B4FC" />
          <Text
            style={{ fontSize: rf(1.25) }}
            className="mt-2 font-main-bold text-indigo-100"
          >
            Preparing score options…
          </Text>
        </MotiView>
      )}
    </View>
  );
};

export default React.memo(QuizOptions);
