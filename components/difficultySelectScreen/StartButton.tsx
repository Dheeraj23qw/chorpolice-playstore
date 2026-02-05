import React, { memo } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence 
} from "react-native-reanimated";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "../Text";

type Props = {
  label: string;
  onPress: () => void;
};

const StartButton = ({ label, onPress }: Props) => {
  const scale = useSharedValue(1);

  // Reanimated-safe press handler
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <View className="shadow-2xl shadow-indigo-500/40">
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Animated.View
          style={[{ height: hp(7.8) }, animatedStyle]}
          className="overflow-hidden rounded-3xl bg-indigo-600 justify-center items-center"
        >
          {/* --- ✨ Internal Lighting Effects --- */}
          {/* Top Edge Highlight */}
          <View className="absolute top-0 left-0 right-0 h-[1px] bg-white/40" />
          
          {/* Subtle Radial Glow */}
          <View 
            className="absolute -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" 
            pointerEvents="none" 
          />

          <View className="flex-row items-center justify-center px-10">
            <Text
              style={{ fontSize: rf(1.7) }}
              className="text-white font-main-bold tracking-[5px] uppercase"
            >
              {label}
            </Text>

            <View
              style={{ width: wp(9), height: wp(9) }}
              className="ml-5 bg-white/15 rounded-2xl items-center justify-center border border-white/20"
            >
              <Ionicons name="arrow-forward" size={rf(2.2)} color="white" />
            </View>
          </View>

          {/* Bottom Shadow Overlay for Depth */}
          <View className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20" />
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default memo(StartButton);