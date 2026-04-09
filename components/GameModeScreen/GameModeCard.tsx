import React from "react";
import { View, Pressable, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { rf, wp, hp } from "@/utils/responsive";
import { GameModeType } from "@/constants/gamemode";
import { Text } from "../Text";

interface Props {
  item: GameModeType;
  index: number;
}

export const GameModeCard = ({ item, index }: Props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(200 + index * 150)
        .springify()
        .damping(12)}
      className="mb-6 w-full"
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={() => (scale.value = withSpring(0.96))}
          onPressOut={() => (scale.value = withSpring(1))}
          onPress={() => router.push(item.route)}
          style={{ height: hp(20) }}
          className="relative flex-row items-center"
        >
          {/* 🌊 PREMIUM GLASS BACK PANEL */}
          <View
            className="absolute right-0 h-[95%] w-[90%] rounded-l-[40px] border-b border-l border-t border-white/10"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 15,
            }}
          />

          {/* 🌟 HERO IMAGE SECTION */}
          <View className="z-20 w-[42%] items-center justify-center">
            <Image
              source={item.image}
              // Scaling image larger than the card height for depth
              style={{
                width: wp(45),
                height: hp(24),
                marginLeft: -wp(4),
                bottom: -hp(1),
              }}
              resizeMode="contain"
            />
          </View>

          {/* 🧠 CONTENT SECTION */}
          <View className="z-30 flex-1 py-4 pl-6">
            {/* TITLE: High Visibility */}
            <Text
              className="font-main-bold uppercase text-white"
              style={{
                fontSize: rf(2.8),
                letterSpacing: 2,
                // Text shadow makes it visible against any background
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 6,
              }}
            >
              {item.title}
            </Text>

            {/* TRANSPARENT GLASS BUTTON */}
            <View
              className="mt-auto flex-row items-center self-start rounded-xl px-4 py-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Text
                className="font-main-bold uppercase"
                style={{
                  color: "white", // White text is more premium than accent color for buttons
                  fontSize: rf(1.3),
                  letterSpacing: 2,
                }}
              >
                {item.buttonText || "PLAY NOW"}
              </Text>

              <View
                className="ml-3 h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: item.accentColor }}
              >
                <Ionicons name="chevron-forward" size={rf(1.4)} color="white" />
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};
