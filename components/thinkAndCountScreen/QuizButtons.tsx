import React, { memo, useEffect } from "react";
import { View, Pressable } from "react-native";
import { Table, FastForward, Split } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { AudioEngine } from "@/audio/audioEngine";
import { Text } from "../Text";

interface ButtonProps {
  showHint: boolean;
  setIsTableOpen: (open: boolean) => void;
  handleNextQuestion: () => void;
  handleFiftyFifty: () => void;
}

/* -------------------- Action Button -------------------- */
const ActionButton = memo(function ActionButton({
  label,
  onPress,
  variant = "primary",
  icon: Icon,
  isAttentionRequired = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent";
  icon?: any;
  isAttentionRequired?: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isAttentionRequired) {
      scale.value = withRepeat(
        withTiming(1.08, {
          duration: 700,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true, // reverse for pulse
      );
    } else {
      scale.value = 1;
    }
  }, [isAttentionRequired]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    AudioEngine.play("select", "ui");
    onPress();
  };

  const themes = {
    primary: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/40",
      text: "text-indigo-400",
      icon: "#818cf8",
    },
    secondary: {
      bg: "bg-white/5",
      border: "border-white/10",
      text: "text-slate-400",
      icon: "#94a3b8",
    },
    accent: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      icon: "#fbbf24",
    },
  };

  const current = themes[variant];

  return (
    <Animated.View style={[{ flex: 1, height: 56 }, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.96 : 1 }],
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        className={`flex-1 flex-row items-center justify-center rounded-2xl border ${current.bg} ${current.border}`}
      >
        {Icon && <Icon size={18} color={current.icon} strokeWidth={2.5} />}
        <Text
          className={`ml-2 font-main-bold text-[11px] uppercase tracking-[2px] ${current.text}`}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

/* -------------------- Quiz Buttons -------------------- */
export const QuizButton: React.FC<ButtonProps> = memo(function QuizButton({
  showHint,
  setIsTableOpen,
  handleNextQuestion,
  handleFiftyFifty,
}) {
  return (
    <View className="mt-4 rounded-[32px] border border-white/[0.05] bg-white/[0.02] px-4 py-6">
      <View className="flex-row gap-3">
        {!showHint && (
          <ActionButton
            label="50:50"
            onPress={handleFiftyFifty}
            variant="secondary"
            icon={Split}
          />
        )}

        <ActionButton
          label="Table"
          onPress={() => setIsTableOpen(true)}
          variant="secondary"
          icon={Table}
          isAttentionRequired={true}
        />
        {showHint && (
          <ActionButton
            label="Proceed"
            onPress={handleNextQuestion}
            variant="accent"
            icon={FastForward}
            isAttentionRequired={true} // pulsating here
          />
        )}
      </View>
    </View>
  );
});
