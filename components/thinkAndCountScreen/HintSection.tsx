import React, { memo } from "react";
import { View, Text, ScrollView } from "react-native";

interface HintSectionProps {
  hint?: string;
}

const HintSection: React.FC<HintSectionProps> = ({ hint }) => {
  return (
    <View className="mx-4 mt-4 rounded-2xl bg-indigo-500/15 border border-white/10 backdrop-blur-xl shadow-lg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="max-h-40 px-4 py-3"
      >
        <Text className="text-white text-[15px] leading-6 font-semibold tracking-wide">
          {hint || "No hint available."}
        </Text>
      </ScrollView>
    </View>
  );
};

export default memo(HintSection);
