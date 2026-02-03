import React from "react";
import { View, ImageBackground } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
} from "react-native-reanimated";
import { Text } from "@/components/Text";

// Create an animated version of your custom Text component
const AnimatedText = Animated.createAnimatedComponent(Text);

interface Props {
  step: number;
  title: string;
  desc: string;
  image: any;
}

export default function RuleCard({ step, title, desc, image }: Props) {
  return (
    <Animated.View
      key={step}
      entering={SlideInRight.springify().duration(450)}
      exiting={FadeOut.duration(200)}
      className="
        bg-white/5 
        border border-white/10 
        rounded-[36px] 
        overflow-hidden 
        shadow-2xl
      "
    >
      <ImageBackground source={image} className="h-[300px] justify-end">
        {/* Gradient-like overlay for text contrast */}
        <View className="absolute inset-0 bg-black/40" />

        <View className="p-8">
          <AnimatedText
            entering={FadeIn.delay(150)}
            // Swapped font-black for font-main-bold
            className="text-white text-3xl font-main-bold mb-3 tracking-tight"
          >
            {title}
          </AnimatedText>

          <AnimatedText
            entering={FadeIn.delay(250)}
            // Using font-main-md for long-form description readability
            className="text-gray-300 text-base font-main-md leading-6"
          >
            {desc}
          </AnimatedText>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}