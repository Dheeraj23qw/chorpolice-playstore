import React, { memo } from "react";
import { TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { rf } from "@/utils/responsive";
import { Text } from "../Text";

interface ButtonOption {
  label: string;
  value: string;
}

interface AvatarSelectionProps {
  selectedOption: string | null;
  setSelectedOption: (option: string | null) => void;
  pickImage: () => Promise<void>;
  options: ButtonOption[];
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  selectedOption,
  setSelectedOption,
  pickImage,
  options,
}) => {
  const handleOptionSelect = async (option: ButtonOption) => {
    if (option.value === "gallery") {
      try {
        setSelectedOption("gallery");
        await pickImage();
      } catch (error) {
        console.error("Error picking image: ", error);
      }
    } else {
      setSelectedOption(selectedOption === option.value ? null : option.value);
    }
  };

  return (
    <View className="w-full flex-row justify-center items-center py-4">
      {options.map((option) => {
        const isSelected = selectedOption === option.value;
        
        // Define styles separately for clarity and to avoid complex logic inside the template
        const containerStyle = isSelected
          ? "bg-indigo-500/40 border-indigo-300/60"
          : "bg-white/[0.07] border-white/20";

        const textStyle = isSelected ? "text-white" : "text-white/50";
        const iconColor = isSelected ? "#fff" : "rgba(255,255,255,0.5)";

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleOptionSelect(option)}
            activeOpacity={0.8}
            className={`flex-row items-center px-8 py-4 rounded-[24px] border-t-[1.5px] border-l-[1px] ${containerStyle}`}
          >
            <MaterialIcons
              name={option.value === "gallery" ? "add-photo-alternate" : "face"}
              size={22}
              color={iconColor}
            />

            <Text
              style={{ fontSize: rf(1.3) }}
              className={`ml-3 font-main-bold uppercase tracking-[2px] ${textStyle}`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const AvatarSelectionMemo = memo(AvatarSelection);