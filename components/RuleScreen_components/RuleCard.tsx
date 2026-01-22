import React from "react";
import { View, ImageBackground } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
} from "react-native-reanimated";

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
        <View className="absolute inset-0 bg-black/50" />

        <View className="p-8">
          <Animated.Text
            entering={FadeIn.delay(150)}
            className="text-white text-3xl font-black mb-3"
          >
            {title}
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(250)}
            className="text-gray-300 text-base leading-6"
          >
            {desc}
          </Animated.Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}
