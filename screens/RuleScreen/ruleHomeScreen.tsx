import React, { memo } from "react";
import {
  Text,
  View,
  Pressable,
  ImageBackground,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { rulesGroups } from "@/constants/gameRules";
import { RuleGroupCard } from "@/components/RuleScreen_components/RuleGroupCard";

export default function RulesHome() {
  return (
    <View className="flex-1 bg-[#0F0F1E]">
      <ImageBackground
        source={require("@/assets/images/bg/quiz.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Dark subtle overlay for depth */}
        <View className="absolute inset-0 bg-[#0F0F1E]/70" />

        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6">
            {/* Header: Centered vertically in top section */}
            <View className="h-[25%] justify-end pb-8">
              <Text className="text-white text-xs font-bold tracking-[4px] text-center uppercase opacity-60 mb-2">
                Knowledge Base
              </Text>
              <Text className="text-white text-4xl font-black text-center tracking-tighter">
                Game Rules
              </Text>
            </View>

            {/* List: Using simple View for best performance on low-end devices */}
            <View className="flex-1">
              {rulesGroups.map((group, index) => (
                <RuleGroupCard key={group.id} group={group} index={index} />
              ))}
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
