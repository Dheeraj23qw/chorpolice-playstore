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
import { AppDispatch } from "@/redux/store";
import { BotEngine } from "@/service/BotEngine";
import { AudioEngine } from "@/audio/audioEngine";
import { setIsGameReset } from "@/redux/reducers/playerReducer";
import HeaderSection from "@/components/GameModeScreen/HeaderSection";
import UserProfilecard from "@/components/GameModeScreen/UserProfilecard";
import GameModeList from "@/components/GameModeScreen/GameModeList";
import UnlockedAwardModal from "@/modal/AchievmentModal";
import { hasUnclaimedAwards } from "@/features/awards/awardsSlice";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  // Consolidate shared values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.98);
  const bgScale = useSharedValue(1.1);

  useEffect(() => {
    BotEngine.prepareEngine(10);
    AudioEngine.stopAllExceptQuiz();

    // Animation trigger
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

  // Optimized Consolidated Styles
  const contentStyle = useAnimatedStyle(() => ({
    opacity: isAnyModalOpen ? withTiming(0, { duration: 300 }) : opacity.value,
    transform: [{ scale: isAnyModalOpen ? 0.95 : scale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
  }));

  return (
    <View className="flex-1 bg-black">
      {/* 🌌 BACKGROUND */}
      <Animated.Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
        style={bgStyle}
      />

      {/* 🌑 DARK OVERLAY - NativeWind utility */}
      <View className="absolute h-full w-full bg-black/40" />

      {/* 🎬 MAIN CONTENT */}
      <Animated.View
        style={[{ paddingTop: insets.top }, contentStyle]}
        className="flex-1"
      >
        <HeaderSection />
        <UserProfilecard />
        <GameModeList onModalToggle={setIsAnyModalOpen} />
      </Animated.View>

      {useSelector(hasUnclaimedAwards) && <UnlockedAwardModal />}
    </View>
  );
};

export default React.memo(GameModeScreen);
