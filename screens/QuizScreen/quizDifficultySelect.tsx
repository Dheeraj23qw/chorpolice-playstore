import React, { memo, useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";

import { hp, wp, rf } from "@/utils/responsive";
import { setDifficulty } from "@/redux/reducers/quiz";
import { SafeBackButton } from "@/components/SafeBackButton";
import { useIsRouterReady } from "@/utils/useIsNavigationReady";
import { AudioEngine } from "@/audio/audioEngine";

import {
  DIFFICULTY_OPTIONS,
  DifficultyOption,
} from "@/constants/difficultyConfig";
import DifficultyCard from "@/components/difficultySelectScreen/DifficultyCard";
import StartButton from "@/components/difficultySelectScreen/StartButton";
import { Text } from "@/components/Text";

const QuizDifficultyScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isReady = useIsRouterReady();

  const [selected, setSelected] = useState<DifficultyOption | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSelect = useCallback(
    (option: DifficultyOption) => {
      AudioEngine.play("select", "ui");
      dispatch(setDifficulty(option));
      setSelected(option);
    },
    [dispatch],
  );

  const handleBegin = useCallback(() => {
    if (!selected || !isReady || isNavigating) return;

    setIsNavigating(true);
    AudioEngine.play("quiz", "ui");

    setTimeout(() => {
      router.replace("/quiz");
    }, 120);
  }, [selected, isReady, isNavigating, router]);

  return (
    <View className="flex-1 bg-[#09090b]">
      <SafeBackButton />

      <ScrollView
        contentContainerStyle={{
          paddingTop: hp(12),
          paddingBottom: hp(20),
          paddingHorizontal: wp(8),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: hp(5) }}>
          <Text
            style={{ fontSize: rf(1.8) }}
            // Swapped font-bold for font-main-bold
            className="text-indigo-400 font-main-bold tracking-widest uppercase mb-2"
          >
            Challenge Level
          </Text>

          <Text
            style={{ fontSize: rf(5.5), lineHeight: hp(6.5) }}
            // Swapped font-black for font-main-bold
            className="font-main-bold text-white"
          >
            Select Your{"\n"}
            <Text className="text-indigo-500 font-main-bold">
              Difficulty
            </Text>
          </Text>
        </View>

        {DIFFICULTY_OPTIONS.map((option) => (
          <DifficultyCard
            key={option}
            option={option}
            selected={selected === option}
            onSelect={handleSelect}
          />
        ))}
      </ScrollView>

      {selected && (
        <View
          style={{ bottom: hp(5), left: wp(8), right: wp(8) }}
          className="absolute"
        >
          <StartButton
            label="Begin Journey"
            onPress={handleBegin}
          />
        </View>
      )}
    </View>
  );
};

export default memo(QuizDifficultyScreen);