import React, { useState, useCallback, useMemo, memo } from "react";
import { View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { rulesGroups } from "@/constants/gameRules";
import ScreenWrapper from "@/components/screenwrapper";
import ProgressBar from "@/components/RuleScreen_components/ProgressBar";
import RuleCard from "@/components/RuleScreen_components/RuleCard";
import StepDots from "@/components/RuleScreen_components/StepDots";
import RulesControls from "@/components/RuleScreen_components/RuleControls";

// Memoized components to prevent unnecessary re-renders during state updates
const MemoizedProgressBar = memo(ProgressBar);
const MemoizedRuleCard = memo(RuleCard);
const MemoizedStepDots = memo(StepDots);
const MemoizedRulesControls = memo(RulesControls);

export default function RulesView() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // 1. Data Logic: Find the correct rule group based on the URL ID
  const group = useMemo(() => rulesGroups.find((g) => g.id === id)!, [id]);

  // 2. State Logic: Manage the current step
  const [step, setStep] = useState(0);
  
  const rule = group.rules[step];
  const totalSteps = group.rules.length;
  const progress = ((step + 1) / totalSteps) * 100;

  // 3. Navigation Logic: Simple conditional checks
  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      // Logic for when rules are finished
      router.replace("/");
    }
  }, [step, totalSteps]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  }, [step]);

  return (
    <ScreenWrapper
      title={group.title}
      variant="dark"
      subtitle={`Rule ${step + 1} of ${totalSteps}`}
    >
      <View className="flex-1 px-6 bg-slate-950">
        
        <View className="mt-6 mb-4">
          <MemoizedProgressBar progress={progress} />
        </View>

        {/* Static Card Container (No Animations/Gestures) */}
        <View className="flex-1 justify-center py-6">
          <View className="items-center">
            <MemoizedRuleCard
              step={step}
              title={rule.title}
              desc={rule.desc}
              image={group.image}
            />
          </View>
        </View>

        {/* Bottom Navigation Controls */}
        <View className="pb-12">
          <MemoizedStepDots
            total={totalSteps}
            activeIndex={step}
          />

          <View className="mt-8">
            <MemoizedRulesControls
              step={step}
              total={totalSteps}
              onNext={handleNext}
              onBack={handleBack}
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}