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
import { AppDispatch } from "@/redux/store";

const QuizDifficultyScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isReady = useIsRouterReady();

  const [selected, setSelected] = useState<DifficultyOption | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showRules, setShowRules] = useState(true);
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
      router.replace("/think-count-quiz");
    }, 120);
  }, [selected, isReady, isNavigating, router]);

  return (
    <View className="flex-1 bg-[#020617]">
      {/* --- 🌌 Ambient Background Art --- */}
      {/* Top Left Glow */}
      <View
        style={{ width: wp(100), height: hp(40), top: -hp(10), left: -wp(20) }}
        className="absolute rounded-full bg-indigo-600/10 blur-[120px]"
        pointerEvents="none"
      />
      {/* Center Right Glow */}
      <View
        style={{ width: wp(80), height: hp(30), top: hp(30), right: -wp(30) }}
        className="absolute rounded-full bg-blue-500/5 blur-[100px]"
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
          <Text
            style={{ fontSize: rf(5.2), lineHeight: rf(6) }}
            className="font-main-bold tracking-tighter text-white"
          >
            Choose your{"\n"}
            <Text className="font-main-bold text-indigo-500">Battlefield</Text>
          </Text>
        </View>

        {/* --- 📜 Rules Notification --- */}
        {showRules && (
          <View
            style={{ marginBottom: hp(3), padding: wp(5) }}
            className="rounded-3xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-md"
          >
            {/* Header with Close Button */}
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-2 h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-400" />
                <Text
                  style={{ fontSize: rf(1.4) }}
                  className="font-main-bold uppercase tracking-widest text-indigo-300"
                >
                  Mission Objective
                </Text>
              </View>

              {/* ✖️ Toggle/Close Button */}
              <View
                onTouchEnd={() => setShowRules(false)}
                className="h-6 w-6 items-center justify-center rounded-full bg-white/10"
              >
                <Text
                  style={{ fontSize: rf(1.2) }}
                  className="font-main-bold text-white"
                >
                  ✕
                </Text>
              </View>
            </View>

            {/* Message Content */}
            <Text
              style={{ fontSize: rf(1.8), lineHeight: rf(2.6) }}
              className="font-main-medium text-slate-300"
            >
              Answer{" "}
              <Text className="font-main-bold text-indigo-400">
                all questions correctly
              </Text>{" "}
              to claim victory. A single mistake leads to{" "}
              <Text className="font-main-bold text-rose-400">defeat</Text>.
            </Text>
          </View>
        )}

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
          className="absolute rounded-[36px] border border-white/5 bg-[#020617]/40 backdrop-blur-xl"
        >
          <View className="shadow-2xl shadow-indigo-500/40">
            <StartButton label="Initiate Quiz" onPress={handleBegin} />
          </View>
        </View>
      )}
    </View>
  );
};

export default memo(QuizDifficultyScreen);
