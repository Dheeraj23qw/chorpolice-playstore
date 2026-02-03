import React from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text } from "../Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  step: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
}

export default function RulesControls({
  step,
  total,
  onNext,
  onBack,
}: Props) {
  const nextScale = useSharedValue(1);
  const backScale = useSharedValue(1);

  const nextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextScale.value }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const isLast = step === total - 1;

  return (
    <View className="flex-row space-x-4 pb-6">
      {step > 0 && (
        <AnimatedPressable
          style={backStyle}
          onPressIn={() => (backScale.value = withSpring(0.92))}
          onPressOut={() => (backScale.value = withSpring(1))}
          onPress={onBack}
          className="
            flex-1 h-16 
            items-center justify-center 
            rounded-2xl 
            border border-white/20
          "
        >
          {/* Swapped font-bold for font-main-bold */}
          <Text className="text-white font-main-bold text-lg">Back</Text>
        </AnimatedPressable>
      )}

      <AnimatedPressable
        style={nextStyle}
        onPressIn={() => (nextScale.value = withSpring(0.92))}
        onPressOut={() => (nextScale.value = withSpring(1))}
        onPress={onNext}
        className={`flex-[2] h-16 items-center justify-center rounded-2xl shadow-lg ${
          isLast ? "bg-green-500" : "bg-amber-500"
        }`}
      >
        {/* Swapped font-black for font-main-bold */}
        <Text className="text-[#0F0F1E] font-main-bold text-lg uppercase tracking-tight">
          {isLast ? "Start Game" : "Next Step"}
        </Text>
      </AnimatedPressable>
    </View>
  );
}