import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "../Text";

interface OptionsSectionProps {
  options: string[] | null;
  handleAnswerSelection: (answer: string) => void;
}

const OptionsSection: React.FC<OptionsSectionProps> = ({
  options,
  handleAnswerSelection,
}) => {
  return (
    <View className="flex-row flex-wrap justify-between px-3 mt-4">
      {options?.map((option, index) => (
        <OptionButton
          key={index}
          label={option}
          onPress={() => handleAnswerSelection(option)}
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
        className="h-[64px] rounded-2xl 
                   bg-[#151515] 
                   border border-white/10
                   items-center justify-center px-2"
      >
        <Text
          numberOfLines={2}
          // Swapped font-semibold for font-main-md
          className="text-white text-sm font-main-md text-center"
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
};