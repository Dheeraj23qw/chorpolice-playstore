import React from "react";
import { View, Pressable, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { wp } from "@/utils/responsive";
import { GameModeType } from "@/constants/gamemode";
import { Text } from "../Text";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  item: GameModeType;
  onPress: () => void;
}

export const GameModeRow = ({ item, onPress }: Props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
        className="overflow-hidden rounded-[40px] border border-white/10"
      >
        <BlurView intensity={25} tint="dark" className="flex-row items-center px-5 py-4">
          <LinearGradient
            colors={["rgba(99, 102, 241, 0.08)", "transparent"]}
            className="absolute inset-0"
          />

          {/* THUMBNAIL */}
          <View className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <Image
              source={item.image}
              style={{ width: wp(17), height: wp(17) }}
              resizeMode="contain"
            />
          </View>

          {/* LABELS */}
          <View className="ml-4 mr-3 flex-1">
            <Text className="font-main-bold text-xl tracking-tight text-white">
              {item.title}
            </Text>
            <Text className="mt-1 text-[10px] uppercase tracking-widest text-white/40">
              {item.subtitle}
            </Text>
          </View>

          {/* CHEVRON */}
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Ionicons name="arrow-forward" size={16} color="white" />
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};

export default React.memo(GameModeRow);
