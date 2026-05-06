import React from "react";
import { View, Pressable, Image, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { rf, wp, hp } from "@/utils/responsive";
import { GameModeType } from "@/constants/gamemode";
import { Text } from "../Text";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface Props {
  item: GameModeType;
  index: number;
  onPress: () => void;
  scrollX: SharedValue<number>;
}

export const GameModeCard = ({ item, index, onPress, scrollX }: Props) => {
  const scale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    
    const opacity = interpolate(
      scrollX.value,
      input,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );

    const cardScale = interpolate(
      scrollX.value,
      input,
      [0.92, 1, 0.92],
      Extrapolation.CLAMP
    );

    const rotate = interpolate(
      scrollX.value,
      input,
      [4, 0, -4],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [
        { scale: cardScale * scale.value },
        { rotate: `${rotate}deg` }
      ],
    };
  });

  const animatedImageStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    const translateY = interpolate(
        scrollX.value,
        input,
        [40, 0, 40],
        Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  return (
    <Animated.View style={[animatedCardStyle]} className="w-full">
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.96))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
        className="w-full overflow-hidden rounded-[40px] border border-white/10"
        style={{ height: hp(32) }}
      >
        <BlurView intensity={25} tint="dark" className="flex-1 p-5">
            <LinearGradient
                colors={["rgba(99, 102, 241, 0.08)", "transparent"]}
                className="absolute inset-0"
            />

            {/* 🌟 HERO IMAGE */}
            <View className="flex-1 items-center justify-center">
                <Animated.Image
                    source={item.image}
                    style={[
                        animatedImageStyle,
                        {
                            width: wp(60),
                            height: hp(18),
                        }
                    ]}
                    resizeMode="contain"
                />
            </View>

            {/* 🧠 CONTENT SECTION */}
            <View className="mt-4 items-center">
                <Text className="text-center font-main-bold text-2xl tracking-tight text-white mb-1">
                    {item.title}
                </Text>
                <Text className="text-center text-[10px] text-white/40 uppercase tracking-widest">{item.subtitle}</Text>
                
                <View
                    className="flex-row items-center rounded-2xl px-6 py-2.5 mt-4"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <Text className="font-main-bold uppercase text-white mr-3 tracking-widest text-[10px]">
                        {item.buttonText || "PLAY NOW"}
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color="white" />
                </View>
            </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};
