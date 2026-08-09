import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

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
  
  useEffect(() => {
    BotEngine.prepareEngine(10);
    AudioEngine.stopAllExceptQuiz();

    const timer = setTimeout(() => dispatch(setIsGameReset(false)), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* 1. BACKGROUND */}
      <Image
        source={require("@/assets/images/bg/image.webp")}
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
        style={{ paddingTop: insets.top, opacity: isModalOpen ? 0 : 1 }}
      >
        {/* Header Section */}
        <HeaderSection />

        {/* Profile Card */}
        <View className="px-5 mb-4">
            <UserProfilecard />
        </View>

        {/* Game List */}
        <View className="flex-1 pb-6">
            <GameModeList />
        </View>
      </View>

      <UnlockedAwardModal />
    </View>
  );
};

export default React.memo(GameModeScreen);
