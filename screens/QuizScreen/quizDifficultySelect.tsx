import React, { memo, useCallback, useState } from "react";
import { View, ScrollView, Platform } from "react-native";
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
    [dispatch]
  );

  const handleBegin = useCallback(() => {
    if (!selected || !isReady || isNavigating) return;

    setIsNavigating(true);
    AudioEngine.play("quiz", "ui");

    setTimeout(() => {
      router.replace("/think-count-quiz");
    }, 120);
  }, [selected, isReady, isNavigating, router]);

  return (
    <View className="flex-1 bg-[#020617]"> 
      {/* --- 🌌 Ambient Background Art --- */}
      {/* Top Left Glow */}
      <View 
        style={{ width: wp(100), height: hp(40), top: -hp(10), left: -wp(20) }}
        className="absolute bg-indigo-600/10 blur-[120px] rounded-full" 
        pointerEvents="none" 
      />
      {/* Center Right Glow */}
      <View 
        style={{ width: wp(80), height: hp(30), top: hp(30), right: -wp(30) }}
        className="absolute bg-blue-500/5 blur-[100px] rounded-full" 
        pointerEvents="none" 
      />

      {/* --- 🔙 Navigation --- */}
      <View className="z-50">
        <SafeBackButton />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: hp(15), // Responsive Top Spacing
          paddingBottom: hp(25), // Extra space for floating button
          paddingHorizontal: wp(7),
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* --- 🏷️ Header Section --- */}
        <View style={{ marginBottom: hp(5) }}>
          <View className="flex-row items-center mb-4">
            <View className="h-[1px] w-10 bg-indigo-500/50 mr-3" />
            <Text
              style={{ fontSize: rf(1.5) }}
              className="text-indigo-400 font-main-bold tracking-[4px] uppercase"
            >
              Mode Selection
            </Text>
          </View>

          <Text
            style={{ fontSize: rf(5.2), lineHeight: rf(6) }}
            className="font-main-bold text-white tracking-tighter"
          >
            Choose your{"\n"}
            <Text className="text-indigo-500">Battlefield</Text>
          </Text>
          
          <Text 
            style={{ fontSize: rf(1.7) }}
            className="text-slate-400 font-main-md mt-4 leading-6 opacity-80"
          >
            Every level has its own rewards and challenges. Are you ready?
          </Text>
        </View>

        {/* --- 🗂️ Difficulty Grid/List --- */}
        <View style={{ gap: hp(2) }}>
          {DIFFICULTY_OPTIONS.map((option) => (
            <DifficultyCard
              key={option}
              option={option}
              selected={selected === option}
              onSelect={handleSelect}
            />
          ))}
        </View>
      </ScrollView>

      {/* --- 🚀 Fixed Bottom Button --- */}
      {selected && (
        <View
          style={{ 
            bottom: hp(5), 
            left: wp(7), 
            right: wp(7),
            padding: 4,
          }}
          className="absolute rounded-[36px] bg-[#020617]/40 backdrop-blur-xl border border-white/5"
        >
          <View className="shadow-2xl shadow-indigo-500/40">
             <StartButton
               label="Initiate Quiz"
               onPress={handleBegin}
             />
          </View>
        </View>
      )}
    </View>
  );
};

export default memo(QuizDifficultyScreen);