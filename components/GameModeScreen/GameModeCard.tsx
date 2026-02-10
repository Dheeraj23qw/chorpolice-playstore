import React from "react";
import { View, Pressable, ImageBackground } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { rf, hp } from "@/utils/responsive";
import { GameModeType } from "@/constants/gamemode";
import { Text } from "../Text";

interface Props {
  item: GameModeType;
  index: number;
}

export const GameModeCard = ({ item, index }: Props) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.5);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 120).springify()}
      className="mb-8"
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={() => {
            scale.value = withSpring(0.96);
            glow.value = withTiming(0.9);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
            glow.value = withTiming(0.5);
          }}
          onPress={() => router.push(item.route)}
          style={{ height: hp(28) }}
          className="rounded-[34px] overflow-hidden"
        >
          {/* Neon Glow Background */}
          <Animated.View
            style={[
              glowStyle,
              {
                backgroundColor: item.accentColor,
                shadowColor: item.accentColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 40,
              },
            ]}
            className="absolute inset-4 rounded-[40px]"
          />

          {/* Main Card */}
          <View className="flex-1 rounded-[34px] bg-[#12121C]/90 border border-white/10 overflow-hidden">
            <ImageBackground source={item.image} className="flex-1">
              {/* Dark glass overlay */}
              <View className="absolute inset-0 bg-black/60 backdrop-blur-md" />

              <View className="flex-1 p-6 justify-between">
                {/* Top Section */}
                <View className="flex-row justify-between items-center">
                  {/* Difficulty Badge */}
                  <View
                    style={{
                      borderColor: item.accentColor,
                      backgroundColor: `${item.accentColor}20`,
                    }}
                    className="px-4 py-1.5 rounded-full border"
                  >
                    <Text
                      style={{
                        fontSize: rf(1.1),
                        color: item.accentColor,
                        letterSpacing: 1.2,
                      }}
                      className="font-main-bold uppercase"
                    >
                      {item.difficulty}
                    </Text>
                  </View>

                  {/* Icon Box */}
                  <View
                    style={{
                      backgroundColor: `${item.accentColor}20`,
                      borderColor: `${item.accentColor}40`,
                    }}
                    className="w-12 h-12 rounded-2xl items-center justify-center border"
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={rf(2.4)}
                      color={item.accentColor}
                    />
                  </View>
                </View>

                {/* Bottom Section */}
                <View>
                  <Text
                    style={{ fontSize: rf(3.3), lineHeight: rf(3.8) }}
                    className="text-white font-main-bold"
                  >
                    {item.title}
                  </Text>

                  <Text
                    className="text-white/60 mt-1 mb-5 font-main-md"
                    style={{ fontSize: rf(1.4) }}
                  >
                    {item.subtitle}
                  </Text>

                  {/* CTA Button */}
                  <View
                    style={{ backgroundColor: item.accentColor }}
                    className="h-12 rounded-2xl flex-row items-center justify-center"
                  >
                    <Text className="font-main-bold uppercase text-white tracking-wider mr-2 text-xs">
                      {item.buttonText}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={rf(2)}
                      color="white"
                    />
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};
