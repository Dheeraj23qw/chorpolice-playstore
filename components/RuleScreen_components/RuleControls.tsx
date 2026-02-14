import React, { memo } from "react";
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

const RulesControls = memo(({ step, total, onNext, onBack }: Props) => {
  const nextScale = useSharedValue(1);
  const backScale = useSharedValue(1);

  const nextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextScale.value }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const isLast = step === total - 1;

  // Optimized Press Handler with Haptics
  const handlePress = (type: "next" | "back") => {
    if (type === "next") onNext();
    else onBack();
  };

  return (
    <View className="flex-row items-center gap-x-4 pb-8">
      {step > 0 && (
        <AnimatedPressable
          style={backStyle}
          onPressIn={() => (backScale.value = withSpring(0.94))}
          onPressOut={() => (backScale.value = withSpring(1))}
          onPress={() => handlePress("back")}
          className="flex-1 h-14 items-center justify-center rounded-[20px] bg-white/5 border border-white/10"
        >
          <Text className="text-slate-400 font-main-bold text-base">Back</Text>
        </AnimatedPressable>
      )}

      <AnimatedPressable
        style={nextStyle}
        onPressIn={() => (nextScale.value = withSpring(0.96))}
        onPressOut={() => (nextScale.value = withSpring(1))}
        onPress={() => handlePress("next")}
        className={`flex-[2.5] h-14 items-center justify-center rounded-[20px] shadow-xl ${
          isLast ? "bg-emerald-500 shadow-emerald-500/30" : "bg-indigo-600 shadow-indigo-500/40"
        }`}
      >
        <Text className="text-white font-main-bold text-[15px] uppercase tracking-[1px]">
          {isLast ? "Finish & Start" : "Continue"}
        </Text>
        
        {/* Subtle Metamorphic Shine */}
        <View className="absolute top-0 left-0 right-0 h-[40%] bg-white/10 rounded-t-[20px]" />
      </AnimatedPressable>
    </View>
  );
});

export default RulesControls;