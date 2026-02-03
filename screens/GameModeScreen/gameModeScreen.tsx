import React, { useCallback, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackgroundOrbs from "@/components/GameModeScreen/BackgroundOrbs";
import HeaderSection from "@/components/GameModeScreen/HeaderSection";
import GameModeList from "@/components/GameModeScreen/GameModeList";
import { AudioEngine } from "@/audio/audioEngine";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setIsGameReset } from "@/redux/reducers/playerReducer";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Entrance animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  // Subtle breathing animation
  const scale = useSharedValue(1);

  const dispatch = useDispatch<AppDispatch>();

  const isGameReset = useSelector(
    (state: RootState) => state.player.isGameReset,
  );

useEffect(() => {
  try {
    AudioEngine.stopAllExceptQuiz();
    const timer = setTimeout(() => {
      dispatch(setIsGameReset(false));
    }, 500);
    return () => clearTimeout(timer);
  } catch (err) {
    console.error("Error in GameModeScreen effect:", err);
  }
}, [dispatch,isGameReset]);


useFocusEffect(
  useCallback(() => {
    opacity.value = withTiming(1, { duration: 700 });
    translateY.value = withSpring(0, { damping: 14, stiffness: 90 });

    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    return () => {
      opacity.value = withTiming(0, { duration: 500 });
      translateY.value = withTiming(40, { duration: 500 });
    };
  }, [])
);


  const animatedContainer = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <View className="flex-1 bg-[#050508]">
      <BackgroundOrbs />

      <Animated.View
        style={[animatedContainer, { paddingTop: insets.top }]}
        className="flex-1"
      >
        <HeaderSection />
        <GameModeList />
      </Animated.View>
    </View>
  );
};

export default React.memo(GameModeScreen);
