import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "../Text";
import type { LocalizedQuizOption } from "@/utils/QuestionTranslator";

interface OptionsSectionProps {
  options: Array<string | LocalizedQuizOption> | null;
  handleAnswerSelection: (answer: string) => void;
}

const OptionsSection: React.FC<OptionsSectionProps> = ({
  options,
  handleAnswerSelection,
}) => {
  const normalizedOptions =
    options?.map((option) =>
      typeof option === "string"
        ? { label: option, value: option }
        : option,
    ) || [];

  return (
    <View className="flex-row flex-wrap justify-between px-3 mt-4">
      {normalizedOptions.map((option, index) => (
        <OptionButton
          key={`${option.value}-${index}`}
          label={option.label}
          onPress={() => handleAnswerSelection(option.value)}
        />
      ))}
    </View>
  );
};

export default OptionsSection;

/* -------------------------------------------
   Single Option Button (No Animation)
-------------------------------------------- */

interface OptionButtonProps {
  label: string;
  onPress: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  onPress,
}) => {
  return (
    <View className="w-[48%] mb-3">
      <Pressable
        onPress={onPress}
        className="min-h-[72px] rounded-2xl 
                   bg-[#151515] 
                   border border-white/10
                   items-center justify-center px-3 py-3"
      >
        <Text
          numberOfLines={3}
          // Swapped font-semibold for font-main-md
          className="text-white text-sm font-main-md text-center"
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
};
