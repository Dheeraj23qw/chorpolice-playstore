import React, { memo, useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";

// Import your new global responsive utilities
import { hp, wp, rf } from "@/utils/responsive";

import { setDifficulty } from "@/redux/reducers/quiz";
import { playSound } from "@/redux/reducers/soundReducer";
import { SafeBackButton } from "@/components/SafeBackButton";

import { useIsRouterReady } from "@/utils/useIsNavigationReady";

type DifficultyOption = "easy" | "medium" | "hard";
const OPTIONS: DifficultyOption[] = ["easy", "medium", "hard"];

/* ======================================================
   Premium Start Button (Responsive)
====================================================== */

const StartButton = memo(
  ({ label, onPress }: { label: string; onPress: () => void }) => {
    return (
      <View className="shadow-2xl shadow-indigo-500/60">
        <Pressable
          onPress={onPress}
          style={{ height: hp(7.5) }}
          className="active:scale-[0.97] active:opacity-90 transition-all overflow-hidden rounded-2xl bg-indigo-600 border-b-4 border-indigo-800"
        >
          <View className="flex-1 px-8 flex-row items-center justify-center relative">
            <View className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/30" />

            <Text
              style={{ fontSize: rf(1.8) }}
              className="text-white font-black tracking-[4px] uppercase"
            >
              {label}
            </Text>

            <View
              style={{ width: wp(8), height: wp(8) }}
              className="ml-4 bg-indigo-500 rounded-full items-center justify-center border border-white/20"
            >
              <Ionicons name="chevron-forward" size={rf(2)} color="white" />
            </View>
          </View>
        </Pressable>
      </View>
    );
  },
);

/* ======================================================
   Premium Difficulty Card (Responsive)
====================================================== */

const DifficultyCard = memo(({ option, selected, onSelect }: any) => {
  const config = {
    easy: {
      icon: "leaf-outline",
      color: "#22c55e",
      desc: "A relaxed pace for everyone",
    },
    medium: {
      icon: "thunderstorm-outline",
      color: "#f59e0b",
      desc: "Test your limits",
    },
    hard: {
      icon: "skull-outline",
      color: "#ef4444",
      desc: "Only for the true experts",
    },
  }[option as DifficultyOption];

  return (
    <Pressable
      onPress={() => onSelect(option)}
      style={{ padding: wp(0.4), marginBottom: hp(2) }}
      className={`relative rounded-[32px] overflow-hidden ${selected ? "bg-indigo-500/50" : "bg-white/10"}`}
    >
      <View
        style={{ paddingHorizontal: wp(6), paddingVertical: hp(3) }}
        className={`rounded-[31px] ${selected ? "bg-[#1e1b4b]" : "bg-[#121212]"}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              style={{
                backgroundColor: selected
                  ? config.color
                  : "rgba(255,255,255,0.05)",
                width: wp(14),
                height: wp(14),
              }}
              className="rounded-2xl items-center justify-center mr-5"
            >
              <Ionicons
                name={config.icon as any}
                size={rf(3.5)}
                color={selected ? "white" : "rgba(255,255,255,0.4)"}
              />
            </View>

            <View className="flex-1">
              <Text
                style={{ fontSize: rf(2.4) }}
                className={`font-bold ${selected ? "text-white" : "text-white/70"}`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
              <Text
                style={{ fontSize: rf(1.6) }}
                className="text-white/40 mt-1"
                numberOfLines={1}
              >
                {config.desc}
              </Text>
            </View>
          </View>

          <View
            style={{ width: wp(6), height: wp(6) }}
            className={`rounded-full border-2 items-center justify-center ${
              selected ? "border-indigo-400 bg-indigo-400" : "border-white/20"
            }`}
          >
            {selected && (
              <Ionicons name="checkmark" size={rf(1.6)} color="white" />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

/* ======================================================
   Main Screen
====================================================== */

const QuizDifficultyScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<DifficultyOption | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const isReady = useIsRouterReady();
  const handleSelect = useCallback(
    (option: DifficultyOption) => {
      dispatch(playSound("select"));
      dispatch(setDifficulty(option));
      setSelected(option);
    },
    [dispatch],
  );

  // ✅ Optimized Navigation Handler
  const handleBegin = useCallback(() => {
    if (!selected || !isReady || isNavigating) return;

    setIsNavigating(true);
    dispatch(playSound("start")); 

    setTimeout(() => {
      router.replace("/quiz");
    }, 100);
  }, [selected, isReady, isNavigating, router, dispatch]);

  return (
    <View className="flex-1 bg-[#09090b]">
      {/* Background Decor */}
      <View
        style={{ width: wp(80), height: wp(80), top: -hp(10), right: -wp(20) }}
        className="absolute bg-indigo-600/20 rounded-full blur-3xl"
      />
      <View
        style={{ width: wp(60), height: wp(60), top: hp(40), left: -wp(20) }}
        className="absolute bg-purple-600/10 rounded-full blur-3xl"
      />

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
            className="text-indigo-400 font-bold tracking-widest uppercase mb-2"
          >
            Challenge Level
          </Text>
          <Text
            style={{ fontSize: rf(5.5), lineHeight: hp(6.5) }}
            className="font-black text-white leading-tight"
          >
            Select Your{"\n"}
            <Text className="text-indigo-500">Difficulty</Text>
          </Text>
        </View>

        {OPTIONS.map((option) => (
          <DifficultyCard
            key={option}
            option={option}
            selected={selected === option}
            onSelect={handleSelect}
          />
        ))}
      </ScrollView>

      {/* Responsive Floating CTA */}
      {selected && (
        <View
          style={{ bottom: hp(5), left: wp(8), right: wp(8) }}
          className="absolute"
        >
          <StartButton label="Begin Journey" onPress={handleBegin} />
        </View>
      )}
    </View>
  );
};

export default memo(QuizDifficultyScreen);
