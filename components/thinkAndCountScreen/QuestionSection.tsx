import React from "react";
import { View } from "react-native";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "../Text";

interface QuestionSectionProps {
  question: string;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ question }) => {
  return (
    <View className="items-center justify-center">
      {/* Glow Effect behind the card */}
      <View
        style={{ width: wp(60), height: hp(10) }}
        className="absolute rounded-full bg-indigo-500/10 blur-3xl"
      />

      {/* Outer Border Shell */}
      <View
        style={{ width: wp(88), padding: wp(1) }}
        className="rounded-[32px] border border-white/10 bg-white/5"
      >
        {/* Inner Card (The HUD) */}
        <View
          style={{ paddingVertical: hp(4), paddingHorizontal: wp(6) }}
          className="items-center justify-center rounded-[30px] border border-white/5 bg-[#121212]/60"
        >
          {/* Decorative Corner Accent (Top Left) */}
          <View className="absolute left-4 top-4 h-3 w-3 border-l-2 border-t-2 border-indigo-500/50" />
          {/* Decorative Corner Accent (Bottom Right) */}
          <View className="absolute bottom-4 right-4 h-3 w-3 border-b-2 border-r-2 border-indigo-500/50" />

          <Text
            style={{
              fontSize: rf(2.4),
              lineHeight: rf(3.2),
            }}
            // Swapped font-bold for font-main-bold
            className="text-center font-main-bold tracking-tight text-white"
            numberOfLines={6}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {question || "Loading your next challenge..."}
          </Text>

          {/* Bottom Aesthetic Detail */}
          <View className="mt-6 flex-row items-center">
            <View className="h-[1px] w-4 bg-white/10" />
            <View className="mx-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <View className="h-[1px] w-4 bg-white/10" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default QuestionSection;
