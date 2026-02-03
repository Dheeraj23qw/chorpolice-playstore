import React from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import AnimatedLogoLoader from "./AnimatedLogoLoader";
import { Text } from "./Text";

interface Props {
  visible: boolean;
  message?: string;
}

const GlobalLoader: React.FC<Props> = ({ visible, message = "Loading..." }) => {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 z-50 items-center justify-center bg-black/70"
    >
      {/* Card */}
      <View className=" px-10 py-8 rounded-3xl items-center">
        {/* Animated Logo */}
        <AnimatedLogoLoader />

        {/* Message */}
        <Text className="text-white font-main-bold text-sm mt-5 tracking-wide">{message}</Text>
      </View>
    </Animated.View>
  );
};

export default React.memo(GlobalLoader);
