import React from "react";
import { View, Pressable, ImageBackground, Text } from "react-native";
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

interface Props {
  item: GameModeType;
  index: number;
}

export const GameModeCard = ({ item, index }: Props) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: item.accentColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value,
    shadowRadius: 25,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 120).springify()}
      className="mb-8"
    >
      <Animated.View style={pressStyle}>
        <Pressable
          onPressIn={() => {
            scale.value = withSpring(0.97);
            glowOpacity.value = withTiming(0.9);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
            glowOpacity.value = withTiming(0.4);
          }}
          onPress={() => router.push(item.route)}
          style={{ height: hp(28) }}
          className="rounded-[32px] overflow-hidden"
        >
          {/* Glow */}
          <Animated.View
            style={[
              glowStyle,
              { backgroundColor: item.accentColor },
            ]}
            className="absolute inset-6 rounded-full"
          />

          {/* Card */}
          <View className="flex-1 rounded-[32px] bg-[#0F0F18] border border-white/10 overflow-hidden">
            <ImageBackground
              source={item.image}
              className="flex-1"
              imageStyle={{ opacity: 0.2 }}
            >
              <View className="absolute inset-0 bg-black/70" />

              <View className="flex-1 p-6 justify-between">
                {/* Top */}
                <View className="flex-row justify-between items-center">
                  <View
                    style={{
                      borderColor: `${item.accentColor}50`,
                      backgroundColor: "rgba(0,0,0,0.6)",
                    }}
                    className="px-4 py-1.5 rounded-full border"
                  >
                    <Text
                      style={{
                        fontSize: rf(1.1),
                        color: item.accentColor,
                        letterSpacing: 1.5,
                      }}
                      className="font-bold uppercase"
                    >
                      {item.difficulty}
                    </Text>
                  </View>

                  <View className="w-12 h-12 rounded-2xl bg-black/40 items-center justify-center border border-white/10">
                    <Ionicons
                      name={item.icon}
                      size={rf(2.4)}
                      color={item.accentColor}
                    />
                  </View>
                </View>

                {/* Bottom */}
                <View>
                  <Text
                    style={{ fontSize: rf(3.5), lineHeight: rf(4) }}
                    className="text-white font-black"
                  >
                    {item.title}
                  </Text>

                  <Text
                    className="text-white/50 mt-1 mb-4"
                    style={{ fontSize: rf(1.4) }}
                  >
                    {item.subtitle}
                  </Text>

                  <View
                    style={{ backgroundColor: item.accentColor }}
                    className="h-12 px-8 rounded-2xl flex-row items-center justify-center"
                  >
                    <Text className="text-black  font-extrabold mr-2 uppercase text-xs tracking-widest">
                      {item.buttonText}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={rf(1.8)}
                      color="black"
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
