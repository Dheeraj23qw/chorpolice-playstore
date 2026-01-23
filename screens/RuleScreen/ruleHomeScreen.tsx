import React from "react";
import { Text, View, Pressable, ImageBackground } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { rulesGroups } from "@/constants/gameRules";
import { RuleGroupCard } from "@/components/RuleScreen_components/RuleGroupCard";

export default function RulesHome() {
  const insets = useSafeAreaInsets(); // 👈 dynamic notch spacing

  return (
    <View className="flex-1 ">
      <ImageBackground
        source={require("@/assets/images/bg/quiz.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Dark overlay – prevents system light mode washout */}
        <View className="absolute inset-0 bg-[#0F0F1E]/75" />

        <View className="flex-1">
          {/* 🔙 Back Button */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 12,
              left: insets.left + 16,
              zIndex: 20,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-black/60 items-center justify-center active:scale-95"
            >
              <ChevronLeft size={26} color="grey" />
            </Pressable>
          </View>

          <View className="flex-1 px-6">
            {/* Header */}
            <View className="h-[25%] justify-end pb-8">
              <Text className="text-white text-xs font-bold tracking-[4px] text-center uppercase opacity-60 mb-2">
                Knowledge Base
              </Text>
              <Text className="text-white text-4xl font-black text-center tracking-tighter">
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
