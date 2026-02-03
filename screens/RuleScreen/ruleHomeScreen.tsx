import React from "react";
import { View, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { rulesGroups } from "@/constants/gameRules";
import { RuleGroupCard } from "@/components/RuleScreen_components/RuleGroupCard";
import { SafeBackButton } from "@/components/SafeBackButton";
import { Text } from "@/components/Text";

export default function RulesHome() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("@/assets/images/bg/quiz.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Dark overlay – prevents system light mode washout */}
        <View className="absolute inset-0 bg-[#0F0F1E]/75" />

        <View className="flex-1">
          {/* 🔙 Back Button */}
          <SafeBackButton />

          <View className="flex-1 px-6">
            {/* Header */}
            <View className="h-[25%] justify-end pb-8">
              <Text 
                // Swapped font-bold for font-main-bold
                className="text-white text-xs font-main-bold tracking-[4px] text-center uppercase opacity-60 mb-2"
              >
                Knowledge Base
              </Text>
              <Text 
                // Swapped font-black for font-main-bold
                className="text-white text-4xl font-main-bold text-center tracking-tighter"
              >
                Game Rules
              </Text>
            </View>

            {/* Rules List */}
            <View className="flex-1">
              {rulesGroups.map((group, index) => (
                <RuleGroupCard key={group.id} group={group} index={index} />
              ))}
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}