import React, { useState, useCallback } from "react";
import { View, ImageBackground } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { rulesGroups } from "@/constants/gameRules";
import RulesHeader from "@/components/RuleScreen_components/RulesHeader";
import ProgressBar from "@/components/RuleScreen_components/ProgressBar";
import RuleCard from "@/components/RuleScreen_components/RuleCard";
import StepDots from "@/components/RuleScreen_components/StepDots";
import RulesControls from "@/components/RuleScreen_components/RuleControls";


export default function RulesView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = rulesGroups.find((g) => g.id === id)!;

  const [step, setStep] = useState(0);
  const rule = group.rules[step];
  const progress = ((step + 1) / group.rules.length) * 100;

  const handleNext = useCallback(() => {
    if (step < group.rules.length - 1) {
      setStep((p) => p + 1);
    } else {
      router.replace("/");
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((p) => p - 1);
  }, [step]);

  return (
    <ImageBackground
      source={require("@/assets/images/bg/quiz.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="absolute inset-0 bg-[#0F0F1E]/80" />

      <SafeAreaView className="flex-1 px-6">
        <RulesHeader
          title={group.title}
          step={step}
          total={group.rules.length}
        />

        <ProgressBar progress={progress} />

        <View className="flex-1 justify-center">
          <RuleCard
            step={step}
            title={rule.title}
            desc={rule.desc}
            image={group.image}
          />
        </View>

        <StepDots
          total={group.rules.length}
          activeIndex={step}
        />

        <RulesControls
          step={step}
          total={group.rules.length}
          onNext={handleNext}
          onBack={handleBack}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
