import React, { useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    interpolate, 
    Extrapolate 
} from "react-native-reanimated";

import { AppDispatch } from "@/redux/store";
import { AudioEngine } from "@/audio/audioEngine";
import { setIsGameReset } from "@/redux/reducers/playerReducer";
import { selectIsModalOpenUI } from "@/redux/reducers/uiStateSlice";

import {
  HeaderSection,
  UserProfilecard,
  GameModeList,
} from "@/components/GameModeScreen";

import UnlockedAwardModal from "@/modal/AwardModal";
import { BotEngine } from "@/service/QuizBotEngine";
import { hp, wp } from "@/utils/responsive";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const isModalOpen = useSelector(selectIsModalOpenUI);
  
  // 🚀 Buttery Smooth Background Parallax
  const scrollX = useSharedValue(0);

  useEffect(() => {
    BotEngine.prepareEngine(10);
    AudioEngine.stopAllExceptQuiz();

    const timer = setTimeout(() => dispatch(setIsGameReset(false)), 500);
    return () => clearTimeout(timer);
  }, []);

  const animatedBgStyle = useAnimatedStyle(() => {
    const scale = interpolate(
        scrollX.value,
        [-100, 0, 100],
        [1.05, 1, 1.05],
        Extrapolate.CLAMP
    );
    return { transform: [{ scale }] };
  });

  return (
    <View className="flex-1 bg-black">
      {/* 1. BACKGROUND WITH BUTTERY PARALLAX */}
      <Animated.Image
        source={require("@/assets/images/bg/image.webp")}
        style={[animatedBgStyle]}
        className="absolute h-full w-full"
        resizeMode="cover"
      />

      <BlurView intensity={25} tint="dark" className="absolute h-full w-full" />

      <LinearGradient
        colors={[
          "rgba(15, 23, 42, 0.4)",
          "transparent",
          "rgba(99, 102, 241, 0.15)",
          "rgba(0, 0, 0, 0.95)",
        ]}
        locations={[0, 0.25, 0.65, 1]}
        className="absolute h-full w-full"
      />

      {/* 3. CONTENT */}
      <View
        pointerEvents={isModalOpen ? "none" : "auto"}
        className="flex-1"
        style={{ paddingTop: insets.top }}
      >
        {/* Header Section */}
        <HeaderSection />

        {/* Profile Card */}
        <View className="px-5 mb-4">
            <UserProfilecard />
        </View>

        {/* Game List (Pushed to Bottom) */}
        <View className="flex-1 justify-end pb-4">
            <GameModeList scrollX={scrollX} />
        </View>
      </View>

      <UnlockedAwardModal />
    </View>
  );
};

export default React.memo(GameModeScreen);
