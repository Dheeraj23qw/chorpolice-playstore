import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { AppDispatch } from "@/redux/store";
import { BotEngine } from "@/service/QuizBotEngine";
import { AudioEngine } from "@/audio/audioEngine";
import { setIsGameReset } from "@/redux/reducers/playerReducer";

import HeaderSection from "@/components/GameModeScreen/HeaderSection";
import UserProfilecard from "@/components/GameModeScreen/UserProfilecard";
import GameModeList from "@/components/GameModeScreen/GameModeList";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.98);
  const bgScale = useSharedValue(1.1);

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
  }, [bgScale, dispatch, opacity, scale]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isAnyModalOpen ? 0.15 : opacity.value, { duration: 250 }),
    transform: [
      {
        scale: withTiming(isAnyModalOpen ? 0.97 : scale.value, {
          duration: 250,
          easing: Easing.out(Easing.ease),
        }),
      },
    ],
  }));

  // UI-1 FIX: Background ALWAYS stays visible — never fade to 0.
  // When a modal opens, only the content dims. The bg is the app's identity.
  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
  }));

  // A soft dark scrim over the bg when a modal is open (not full black)
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isAnyModalOpen ? 0.55 : 0, { duration: 250 }),
  }));

  return (
    <View className="flex-1 bg-black">
      <Animated.View
        style={[{ position: "absolute", inset: 0 }, backgroundStyle]}
      >
        <Animated.Image
          source={require("@/assets/images/bg/image.png")}
          className="absolute h-full w-full"
          resizeMode="cover"
          style={{ transform: [{ scale: bgScale.value }] }}
        />

        <BlurView
          intensity={25}
          tint="dark"
          className="absolute h-full w-full"
        />
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
      </Animated.View>

      {/* Soft scrim over bg when modal is open — bg stays visible */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: "absolute", inset: 0, backgroundColor: "#000" },
          scrimStyle,
        ]}
      />

      <Animated.View
        style={[{ paddingTop: insets.top }, contentStyle]}
        className="flex-1"
      >
        <HeaderSection />
        <UserProfilecard />
        <GameModeList onModalToggle={setIsAnyModalOpen} />
      </Animated.View>
    </View>
  );
};

export default React.memo(GameModeScreen);
