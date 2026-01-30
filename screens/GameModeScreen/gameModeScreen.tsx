import React, { useCallback } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackgroundOrbs from "@/components/GameModeScreen/BackgroundOrbs";
import HeaderSection from "@/components/GameModeScreen/HeaderSection";
import GameModeList from "@/components/GameModeScreen/GameModeList";



const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      opacity.value = withTiming(1, { duration: 800 });
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 3000 }),
          withTiming(1, { duration: 3000 })
        ),
        -1,
        true
      );

      return () => {
        opacity.value = 0;
      };
    }, [])
  );

  const animatedContainer = useAnimatedStyle(() => ({
    opacity: opacity.value,
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
