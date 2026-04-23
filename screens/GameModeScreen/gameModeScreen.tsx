import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView, MotiImage } from "moti";

import { AppDispatch } from "@/redux/store";
import { AudioEngine } from "@/audio/audioEngine";
import { setIsGameReset } from "@/redux/reducers/playerReducer";

import {
  HeaderSection,
  UserProfilecard,
  GameModeList,
} from "@/components/GameModeScreen";

import UnlockedAwardModal from "@/modal/AchievmentModal";
import { hasUnclaimedAwards } from "@/features/awards/awardsSlice";
import { BotEngine } from "@/service/QuizBotEngine";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  const showAwards = useSelector(hasUnclaimedAwards);

  useEffect(() => {
    BotEngine.prepareEngine(10);
    AudioEngine.stopAllExceptQuiz();

    const timer = setTimeout(() => dispatch(setIsGameReset(false)), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* 1. BACKGROUND (Moti animated) */}
      <MotiImage
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
        from={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{
          type: "timing",
          duration: 1200,
        }}
      />

      {/* 2. KEEP YOUR GRADIENTS EXACTLY SAME */}
      <BlurView intensity={25} tint="dark" className="absolute h-full w-full" />

      <LinearGradient
        colors={[
          "rgba(15, 23, 42, 0.4)",
          "transparent",
          "rgba(99, 102, 241, 0.2)",
          "rgba(0, 0, 0, 0.95)",
        ]}
        locations={[0, 0.25, 0.65, 1]}
        className="absolute h-full w-full"
      />

      <LinearGradient
        colors={[
          "rgba(99, 102, 241, 0.22)",
          "rgba(59, 130, 246, 0.12)",
          "transparent",
        ]}
        className="absolute h-[800px] w-[800px] self-center rounded-full opacity-90 blur-3xl"
      />

      {/* 3. CONTENT WITH STAGGER */}
      <MotiView
        className="flex-1"
        style={{ paddingTop: insets.top }}
        animate={{
          opacity: isAnyModalOpen ? 0 : 1,
          scale: isAnyModalOpen ? 0.96 : 1,
        }}
        transition={{
          type: "timing",
          duration: 300,
        }}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100, duration: 500 }}
        >
          <HeaderSection />
        </MotiView>

        {/* Profile */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, duration: 500 }}
        >
          <UserProfilecard />
        </MotiView>

        <View className="flex-1">
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, duration: 500 }}
            className="flex-1"
          >
            <GameModeList onModalToggle={setIsAnyModalOpen} />
          </MotiView>
        </View>
      </MotiView>

      {/* 4. MODAL */}
      {showAwards && <UnlockedAwardModal />}
    </View>
  );
};

export default React.memo(GameModeScreen);
