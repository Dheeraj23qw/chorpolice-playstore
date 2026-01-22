import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  ImageBackground,
  Pressable,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { rulesGroups } from "@/constants/gameRules";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

  /* 🔘 Button press animation */
  const nextScale = useSharedValue(1);
  const backScale = useSharedValue(1);

  const nextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextScale.value }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  return (
    <ImageBackground
      source={require("@/assets/images/bg/quiz.png")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* 🌑 Dark overlay */}
      <View className="absolute inset-0 bg-[#0F0F1E]/80" />

      <SafeAreaView className="flex-1 px-6">
        {/* ───── TOP BAR ───── */}
        <View className="flex-row justify-between items-center py-4">
          <Pressable onPress={() => router.back()} className="px-3 py-2">
            <Text className="text-gray-400 font-bold tracking-wider">
              EXIT
            </Text>
          </Pressable>

          <View className="items-center">
            <Text className="text-white font-black text-lg tracking-widest uppercase">
              {group.title}
            </Text>
            <Text className="text-amber-400 font-bold text-xs">
              STEP {step + 1} OF {group.rules.length}
            </Text>
          </View>

          <View className="w-10" />
        </View>

        {/* ───── PROGRESS BAR ───── */}
        <View className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-8">
          <Animated.View
            layout={Layout.springify()}
            className="h-full bg-amber-500"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* ───── CONTENT ───── */}
        <View className="flex-1 justify-center">
          <Animated.View
            key={step}
            entering={SlideInRight.springify().duration(450)}
            exiting={FadeOut.duration(200)}
            className="
              bg-white/5 
              border border-white/10 
              rounded-[36px] 
              overflow-hidden 
              shadow-2xl
            "
          >
            <ImageBackground
              source={group.image}
              className="h-[300px] justify-end"
            >
              <View className="absolute inset-0 bg-black/50" />

              <View className="p-8">
                <Animated.Text
                  entering={FadeIn.delay(150)}
                  className="text-white text-3xl font-black mb-3"
                >
                  {rule.title}
                </Animated.Text>

                <Animated.Text
                  entering={FadeIn.delay(250)}
                  className="text-gray-300 text-base leading-6"
                >
                  {rule.desc}
                </Animated.Text>
              </View>
            </ImageBackground>
          </Animated.View>
        </View>

        {/* ───── DOTS ───── */}
        <View className="flex-row justify-center my-7">
          {group.rules.map((_, index) => {
            const isActive = index === step;

            return (
              <Animated.View
                key={`dot-${index}`}
                layout={Layout.springify()}
                className="h-2 mx-1 rounded-full"
                style={{
                  width: isActive ? 28 : 8,
                  backgroundColor: isActive
                    ? "#f59e0b"
                    : "rgba(255,255,255,0.2)",
                }}
              />
            );
          })}
        </View>

        {/* ───── CONTROLS ───── */}
        <View className="flex-row space-x-4 pb-6">
          {step > 0 && (
            <AnimatedPressable
              style={backStyle}
              onPressIn={() => (backScale.value = withSpring(0.92))}
              onPressOut={() => (backScale.value = withSpring(1))}
              onPress={handleBack}
              className="
                flex-1 h-16 
                items-center justify-center 
                rounded-2xl 
                border border-white/20
              "
            >
              <Text className="text-white font-bold text-lg">Back</Text>
            </AnimatedPressable>
          )}

          <AnimatedPressable
            style={nextStyle}
            onPressIn={() => (nextScale.value = withSpring(0.92))}
            onPressOut={() => (nextScale.value = withSpring(1))}
            onPress={handleNext}
            className={`flex-[2] h-16 items-center justify-center rounded-2xl shadow-lg ${
              step === group.rules.length - 1
                ? "bg-green-500"
                : "bg-amber-500"
            }`}
          >
            <Text className="text-[#0F0F1E] font-black text-lg uppercase">
              {step === group.rules.length - 1
                ? "Start Game"
                : "Next Step"}
            </Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
