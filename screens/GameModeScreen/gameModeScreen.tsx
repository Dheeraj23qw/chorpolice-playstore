import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { AppDispatch } from "@/redux/store";
import { BotEngine } from "@/service/BotEngine";
import { AudioEngine } from "@/audio/audioEngine";
import { setIsGameReset } from "@/redux/reducers/playerReducer";

import HeaderSection from "@/components/GameModeScreen/HeaderSection";
import UserProfilecard from "@/components/GameModeScreen/UserProfilecard";
import GameModeList from "@/components/GameModeScreen/GameModeList";
import UnlockedAwardModal from "@/modal/AchievmentModal";
import { hasUnclaimedAwards } from "@/features/awards/awardsSlice";
import { LowCoinModal, useLowCoinRewardModal } from "@/features/lowCoinReward";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.98);
  const bgScale = useSharedValue(1.1);
  
  const { visible, onShare, onRate, onClose, onDisableForever}=
    useLowCoinRewardModal();
  useEffect(() => {
    BotEngine.prepareEngine(10);
    AudioEngine.stopAllExceptQuiz();
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });
    bgScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.ease),
    });
    const timer = setTimeout(() => dispatch(setIsGameReset(false)), 500);
    return () => clearTimeout(timer);
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: isAnyModalOpen ? withTiming(0, { duration: 300 }) : opacity.value,
    transform: [{ scale: isAnyModalOpen ? 0.95 : scale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
  }));

  return (
    <View className="flex-1 bg-black">
      {/* 1. BACKGROUND */}
      <Animated.Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
        style={bgStyle}
      />

      {/* 2. FULL-SCREEN ATMOSPHERIC FADE (Indigo Edition) */}
      <BlurView intensity={25} tint="dark" className="absolute h-full w-full" />
      <LinearGradient
        colors={[
          "rgba(15, 23, 42, 0.4)", // Subtle top dark
          "transparent", // Clear mid
          "rgba(99, 102, 241, 0.2)", // Mid-bottom indigo
          "rgba(0, 0, 0, 0.95)", // Deep bottom focus
        ]}
        locations={[0, 0.25, 0.65, 1]}
        className="absolute h-full w-full"
      />

      {/* 3. CENTER GLOW (Indigo Neon) */}
      <LinearGradient
        colors={[
          "rgba(99, 102, 241, 0.22)",
          "rgba(59, 130, 246, 0.12)",
          "transparent",
        ]}
        className="absolute h-[800px] w-[800px] self-center rounded-full opacity-90 blur-3xl"
      />

      {/* 4. CONTENT */}
      <Animated.View
        style={[{ paddingTop: insets.top }, contentStyle]}
        className="flex-1"
      >
        <HeaderSection />
        <UserProfilecard />
        <GameModeList onModalToggle={setIsAnyModalOpen} />
      </Animated.View>

      {useSelector(hasUnclaimedAwards) && <UnlockedAwardModal />}
      <LowCoinModal
        visible={visible}
        onShare={onShare}
        onRate={onRate}
        onClose={onClose}
        onDisable={onDisableForever}
      />
    </View>
  );
};

export default React.memo(GameModeScreen);
