import React, { memo } from "react";
import { Text, View, Pressable, ImageBackground, Dimensions } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { rulesGroups } from "@/constants/gameRules";

const { width } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// 1. Separate Component for performance & following Hook rules
const RuleGroupCard = memo(({ group, index }: { group: any; index: number }) => {
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
          {/* High-performance gradient overlay alternative */}
          <View className="absolute inset-0 bg-black/50" />
          
          <View>
            <Text className="text-white text-[22px] font-black tracking-tight">
              {group.title}
            </Text>
            <View className="h-1 w-8 bg-amber-500 rounded-full my-1.5" />
            <Text className="text-gray-300 text-[14px] font-medium">
              {group.subtitle}
            </Text>
          </View>
        </ImageBackground>
      </AnimatedPressable>
    </Animated.View>
  );
});

export default function RulesHome() {
  return (
    <View className="flex-1 bg-[#0F0F1E]">
      <ImageBackground
        source={require("@/assets/images/bg/quiz.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Dark subtle overlay for depth */}
        <View className="absolute inset-0 bg-[#0F0F1E]/70" />

        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6">
            {/* Header: Centered vertically in top section */}
            <View className="h-[25%] justify-end pb-8">
              <Text className="text-white text-xs font-bold tracking-[4px] text-center uppercase opacity-60 mb-2">
                Knowledge Base
              </Text>
              <Text className="text-white text-4xl font-black text-center tracking-tighter">
                Game Rules
              </Text>
            </View>

            {/* List: Using simple View for best performance on low-end devices */}
            <View className="flex-1">
              {rulesGroups.map((group, index) => (
                <RuleGroupCard key={group.id} group={group} index={index} />
              ))}
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}