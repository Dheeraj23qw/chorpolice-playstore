import React, { memo } from "react";
import { View, Text } from "react-native";
import { rf } from "@/utils/responsive";

interface QuestionBoxProps {
  playerName: string;
}

const QuestionBox: React.FC<QuestionBoxProps> = memo(({ playerName }) => (
  <View className="items-center justify-center w-full px-6 my-4">
    {/* 1. Main Frosted Container */}
    <View 
      className="w-full bg-white/[0.03] border border-white/10 rounded-[32px] py-8 px-4 items-center overflow-hidden"
    >
      {/* 2. Top Glowing Edge (Light Source) */}
      <View className="absolute top-0 h-[2px] w-full bg-indigo-500/20" />
      
      {/* 3. Floating Identity Tag */}
      <View className="bg-indigo-500/10 border border-indigo-400/30 px-4 py-1 rounded-full mb-4">
        <Text 
          style={{ fontSize: rf(1.2) }} 
          className="text-indigo-300 font-bold uppercase tracking-[4px]"
        >
          Active Player
        </Text>
      </View>

      {/* 4. Question Text with Neon Depth */}
      <Text 
        style={{ fontSize: rf(2.6) }} 
        className="text-white/90 text-center font-black tracking-tight leading-tight"
      >
        <Text 
          className="text-indigo-400"
          style={{
            textShadowColor: 'rgba(129, 140, 248, 0.6)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 15,
          }}
        >
          {playerName.toUpperCase()}
        </Text>
        {"\n"}
        <Text style={{ fontSize: rf(1.8) }} className="text-white/40 font-medium tracking-normal">
          WHAT IS YOUR PREDICTED SCORE?
        </Text>
      </Text>

      {/* 5. Bottom Decorative "Scanner" Line */}
      <View className="mt-6 w-full items-center">
        <View className="h-[1px] w-full bg-white/5" />
        <View className="flex-row space-x-2 -mt-[1px]">
          <View className="h-[2px] w-12 bg-indigo-500 shadow-sm shadow-indigo-500" />
        </View>
      </View>
    </View>

    {/* 6. Subtle Drop Reflection */}
    <View 
      className="h-4 w-4/5 bg-indigo-500/5 blur-xl rounded-full -mt-2" 
    />
  </View>
));

QuestionBox.displayName = "QuestionBox";

export default QuestionBox;