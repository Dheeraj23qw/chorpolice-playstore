import React, { memo, useEffect } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withTiming,
  interpolateColor
} from "react-native-reanimated";
import { wp, hp, rf } from "@/utils/responsive";
import {
  DifficultyOption,
  difficultyConfig,
} from "@/constants/difficultyConfig";
import { Text } from "../Text";

type Props = {
  option: DifficultyOption;
  selected: boolean;
  onSelect: (option: DifficultyOption) => void;
};

const DifficultyCard = ({ option, selected, onSelect }: Props) => {
  const config = difficultyConfig[option];
  const scale = useSharedValue(1);
  const activeProgress = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.02 : 1, { damping: 12 });
    activeProgress.value = withTiming(selected ? 1 : 0, { duration: 250 });
  }, [selected]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      ["rgba(255,255,255,0.05)", "rgba(99, 102, 241, 0.5)"] // indigo-500/50
    ),
    backgroundColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      ["rgba(255,255,255,0.03)", "rgba(99, 102, 241, 0.08)"]
    )
  }));

  return (
    <Pressable onPress={() => onSelect(option)}>
      <Animated.View
        style={[
          { 
            paddingHorizontal: wp(5), 
            paddingVertical: hp(2.5),
            borderWidth: 1.5,
            marginBottom: hp(2)
          },
          animatedContainerStyle,
        ]}
        className="rounded-[28px] flex-row items-center relative overflow-hidden"
      >
        {/* --- 💎 Glass Reflection Effect --- */}
        {selected && (
          <View 
            className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" 
            pointerEvents="none" 
          />
        )}

        {/* --- 🎨 Icon Section --- */}
        <View
          style={{
            backgroundColor: selected ? config.color : "rgba(255,255,255,0.05)",
            width: wp(13),
            height: wp(13),
            shadowColor: config.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: selected ? 0.4 : 0,
            shadowRadius: 8,
            elevation: selected ? 5 : 0,
          }}
          className="rounded-2xl items-center justify-center mr-4"
        >
          <Ionicons
            name={config.icon as any}
            size={rf(3)}
            color={selected ? "white" : "rgba(255,255,255,0.3)"}
          />
        </View>

        {/* --- 📝 Text Content --- */}
        <View className="flex-1">
          <Text
            style={{ fontSize: rf(2.1) }}
            className={`font-main-bold tracking-tight ${
              selected ? "text-white" : "text-slate-400"
            }`}
          >
            {option.toUpperCase()}
          </Text>
          <Text
            style={{ fontSize: rf(1.4) }}
            className={`font-main-md mt-0.5 ${
              selected ? "text-indigo-200/60" : "text-slate-600"
            }`}
          >
            {config.desc}
          </Text>
        </View>

        {/* --- ✅ Minimalist Radio Indicator --- */}
        <View
          style={{ 
            width: wp(5), 
            height: wp(5),
            borderColor: selected ? "#818cf8" : "rgba(255,255,255,0.1)"
          }}
          className="rounded-full border-2 items-center justify-center"
        >
          {selected && (
            <View className="w-2.5 h-2.5 bg-indigo-400 rounded-full" />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default memo(DifficultyCard);