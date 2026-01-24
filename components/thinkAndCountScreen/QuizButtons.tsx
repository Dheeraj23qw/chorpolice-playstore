import React, { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch } from "react-redux";

import { playSound } from "@/redux/reducers/soundReducer";

interface ButtonProps {
  showHint: boolean;
  setIsTableOpen: (isOpen: boolean) => void;
  handleNextQuestion: () => void;
  handleFiftyFifty: () => void;
  handleQuit: () => void;
}

/* -------------------------------------------
   Single Button (isolated re-render)
-------------------------------------------- */
const ActionButton = memo(
  ({
    label,
    onPress,
    variant = "primary",
  }: {
    label: string;
    onPress: () => void;
    variant?: "primary" | "danger" | "ghost";
  }) => {
    const dispatch = useDispatch();

    const handlePress = () => {
      dispatch(playSound("select"));
      onPress();
    };

    const base =
      "h-12 min-w-[92px] rounded-xl items-center justify-center px-3";

    const variantStyle =
      variant === "danger"
        ? "bg-red-500/90"
        : variant === "ghost"
        ? "bg-white/10"
        : "bg-indigo-600";

    return (
      <Pressable
        onPress={handlePress}
        className={`${base} ${variantStyle}`}
      >
        <Text className="text-sm font-bold text-white">
          {label}
        </Text>
      </Pressable>
    );
  }
);

/* -------------------------------------------
   Main Buttons Container
-------------------------------------------- */
export const QuizButton: React.FC<ButtonProps> = memo(
  ({
    showHint,
    setIsTableOpen,
    handleNextQuestion,
    handleFiftyFifty,
    handleQuit,
  }) => {
    return (
      <View className="flex-row flex-wrap justify-center gap-3 mt-4">
        {/* 50-50 */}
        {!showHint && (
          <ActionButton
            label="50-50"
            onPress={handleFiftyFifty}
            variant="ghost"
          />
        )}

        {/* Quit */}
        <ActionButton
          label="Quit"
          onPress={handleQuit}
          variant="danger"
        />

        {/* Quiz Table */}
        <ActionButton
          label="Quiz Table"
          onPress={() => setIsTableOpen(true)}
          variant="ghost"
        />

        {/* Next */}
        {showHint && (
          <ActionButton
            label="Next"
            onPress={handleNextQuestion}
            variant="primary"
          />
        )}
      </View>
    );
  }
);
