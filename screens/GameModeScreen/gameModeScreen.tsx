import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

import HeaderSection from "@/components/GameModeScreen/HeaderSection";
import GameModeList from "@/components/GameModeScreen/GameModeList";
import UserProfilecard from "@/components/GameModeScreen/UserProfilecard";

import { AudioEngine } from "@/audio/audioEngine";
import { AppDispatch, RootState } from "@/redux/store";
import { setIsGameReset } from "@/redux/reducers/playerReducer";
import UnlockedAwardModal from "@/modal/AchievmentModal";
import { hasUnclaimedAwards } from "@/features/awards/awardsSlice";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.98);
  const bgScale = useSharedValue(1.1);

  const isGameReset = useSelector(
    (state: RootState) => state.player.isGameReset,
  );

  useEffect(() => {
    // 🔊 audio logic
    AudioEngine.stopAllExceptQuiz();

    const timer = setTimeout(() => {
      dispatch(setIsGameReset(false));
    }, 500);

    // 🎬 SCREEN ANIMATION
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });

    // 🌌 BG subtle zoom-in
    bgScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.ease),
    });

    // 🛡️ SAFETY FALLBACK: Ensure screen is visible even if Reanimated hangs
    const safetyTimer = setTimeout(() => {
      if (opacity.value !== 1) {
        console.warn("⚠️ [GameModeScreen] Animation safety fallback triggered.");
        opacity.value = 1;
        scale.value = 1;
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, []);

  const unclaimedExists = useSelector(hasUnclaimedAwards);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
  }));

  return (
    <View className="flex-1 bg-black">
      {/* 🌌 BACKGROUND IMAGE (ANIMATED) */}
      <Animated.Image
        source={require("@/assets/images/bg/image.png")}
        resizeMode="cover"
        style={[
          {
            position: "absolute",
            width: "100%",
            height: "100%",
          },
          bgStyle,
        ]}
      />

      {/* 🌑 DARK OVERLAY */}
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      />

      {/* 🎬 MAIN CONTENT */}
      <Animated.View style={[{ paddingTop: insets.top, flex: 1 }, screenStyle]}>
        <HeaderSection />
        <UserProfilecard />
        <GameModeList />
      </Animated.View>

      {unclaimedExists && <UnlockedAwardModal />}
    </View>
  );
};

export default React.memo(GameModeScreen);
