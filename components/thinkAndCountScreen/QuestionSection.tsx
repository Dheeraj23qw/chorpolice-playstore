import React from "react";
import { View, Text } from "react-native";
import { hp, wp, rf } from "@/utils/responsive";

interface QuestionSectionProps {
  question: string;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ question }) => {
  return (
    <View className="items-center justify-center">
      {/* Glow Effect behind the card */}
      <View 
        style={{ width: wp(60), height: hp(10) }}
        className="absolute bg-indigo-500/10 blur-3xl rounded-full" 
      />

      {/* Outer Border Shell */}
      <View 
        style={{ width: wp(88), padding: wp(1) }}
        className="bg-white/5 rounded-[32px] border border-white/10"
      >
        {/* Inner Card (The HUD) */}
        <View 
          style={{ paddingVertical: hp(4), paddingHorizontal: wp(6) }}
          className="bg-[#121212]/60 rounded-[30px] items-center justify-center border border-white/5"
        >
          {/* Decorative Corner Accent (Top Left) */}
          <View className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-indigo-500/50" />
          {/* Decorative Corner Accent (Bottom Right) */}
          <View className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-indigo-500/50" />

          {/* Icon/Label for context */}
          <View 
             style={{ marginBottom: hp(2), paddingHorizontal: wp(3), paddingVertical: hp(0.5) }}
             className="bg-indigo-500/20 rounded-full border border-indigo-500/30"
          >
            <Text style={{ fontSize: rf(1.2) }} className="text-indigo-300 font-bold tracking-[2px] uppercase">
              Current Challenge
            </Text>
          </View>

          <Text
            style={{ 
              fontSize: rf(2.4), 
              lineHeight: rf(3.2) 
            }}
            className="text-white font-bold text-center tracking-tight"
            numberOfLines={5}
          >
            {question || "Loading your next challenge..."}
          </Text>

          {/* Bottom Aesthetic Detail */}
          <View className="flex-row items-center mt-6">
            <View className="h-[1px] w-4 bg-white/10" />
            <View className="h-1.5 w-1.5 rounded-full bg-indigo-500 mx-2" />
            <View className="h-[1px] w-4 bg-white/10" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default QuestionSection;