import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, { 
  FadeIn, 
  FadeOut, 
  ZoomIn, 
} from "react-native-reanimated";
import AnimatedLogoLoader from "./AnimatedLogoLoader";

interface Props {
  visible: boolean;
  message?: string;
}

const GlobalLoader: React.FC<Props> = ({ visible }) => {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      className="absolute inset-0 z-[999] items-center justify-center bg-black/80"
    >

      <Animated.Image
        entering={FadeIn.delay(100).duration(800)}
        source={require("@/assets/modalImages/intro.png")}
        className="absolute w-[85%] h-[85%] opacity-20"
        resizeMode="contain"
      />

      {/* 3. The Content Container */}
      <Animated.View 
        entering={ZoomIn.duration(400).springify()}
        className="items-center justify-center p-8 rounded-3xl"
      >
        
        <AnimatedLogoLoader />
        
        {/* Adding a soft-text message if provided */}
        <Animated.Text 
          entering={FadeIn.delay(200)}
          className="mt-6 text-white/70 font-main-bold tracking-widest text-xs uppercase"
        >
          Loading Excellence
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

export default React.memo(GlobalLoader);