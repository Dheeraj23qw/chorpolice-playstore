import React, { memo } from "react";
import { View, Pressable, ImageBackground } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Text } from "../Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RuleGroupCard = memo(({ group, index }: { group: any; index: number }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.97, { damping: 15 }); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(600).springify()}
      className="mb-5 shadow-lg"
    >
      <AnimatedPressable
        style={animatedStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push({ pathname: "/rule", params: { id: group.id } })}
        className="rounded-[32px] overflow-hidden bg-[#1A1A2E] border border-white/10"
      >
        <ImageBackground source={group.image} className="min-h-[130px] justify-center px-8 py-6">
          <View className="absolute inset-0 bg-black/50" />
          
          <View>
            <Text 
              // Changed font-black to font-main-bold
              className="text-white text-[22px] font-main-bold tracking-tight"
            >
              {group.title}
            </Text>
            
            <View className="h-1 w-8 bg-amber-500 rounded-full my-1.5" />
            
            <Text 
              // Changed font-medium to font-main-md
              className="text-gray-300 text-[14px] font-main-md"
            >
              {group.subtitle}
            </Text>
          </View>
        </ImageBackground>
      </AnimatedPressable>
    </Animated.View>
  );
});