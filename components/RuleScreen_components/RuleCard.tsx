import React, { memo } from "react";
import { View, Image, Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  FadeInDown,
} from "react-native-reanimated";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Animated Custom Text
const AnimatedText = Animated.createAnimatedComponent(Text);

interface Props {
  step: number;
  title: string;
  desc: string;
  image: any;
}

// Memoize to prevent unnecessary re-renders during parent state changes
const RuleCard = memo(({ step, title, desc, image }: Props) => {
  return (
    <Animated.View
      key={step}
      entering={SlideInRight.springify().damping(22).stiffness(100)} // Snappier spring
      exiting={FadeOut.duration(150)}
      className="w-full bg-[#0F0F1E] rounded-[48px] overflow-hidden border border-white/10"
      style={{ height: SCREEN_HEIGHT * 0.58 }}
    >
      {/* 1. Optimized Image Layer */}
      <View className="absolute inset-0">
        <Image 
          source={image} 
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Static overlays are faster than dynamic blurs */}
        <View className="absolute inset-0 bg-black/30" />
        <View className="absolute inset-0 bg-[#0F0F1E]/60" style={{ backgroundColor: 'rgba(15, 15, 30, 0.7)' }} />
      </View>

      <View className="flex-1 justify-end p-4">
        {/* 2. Optimized Content Tray (No Blur for performance) */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(400)}
          className="bg-[#1A1A2E] border-t border-white/10 rounded-[40px] p-7"
        >
          {/* Rule Indicator - Simplified for Render Speed */}
          <View className="absolute -top-4 left-8 flex-row items-center">
             <View className="bg-indigo-600 h-9 w-9 items-center justify-center rounded-xl rotate-12 shadow-md">
                <Text className="text-white font-main-bold text-xs -rotate-12">
                   {step + 1}
                </Text>
             </View>
             <View className="bg-[#1A1A2E] px-3 py-1 rounded-r-lg border-y border-r border-white/5 ml-[-5px] -z-10">
                <Text className="text-white/40 text-[8px] font-main-bold uppercase tracking-widest ml-1">
                   Rule
                </Text>
             </View>
          </View>

          <View className="mt-4">
            <AnimatedText
              entering={FadeIn.delay(200)}
              style={{ fontSize: rf(3) }}
              className="text-white font-main-bold mb-2 tracking-tighter leading-9"
            >
              {title}
            </AnimatedText>

            <AnimatedText
              entering={FadeIn.delay(300)}
              className="text-slate-400 text-[14px] font-main-md leading-6"
            >
              {desc}
            </AnimatedText>
          </View>

          {/* Minimalist Accent */}
          <View className="h-1 w-10 bg-indigo-500/20 rounded-full mt-6 self-center" />
        </Animated.View>
      </View>

      {/* 3. Static Glass Polish (Visual Depth without GPU cost) */}
      <View className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/10 mx-12" />
    </Animated.View>
  );
});

export default RuleCard;