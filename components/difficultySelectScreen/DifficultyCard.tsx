import React, { memo } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  return (
    <Pressable
      onPress={() => onSelect(option)}
      style={{ padding: wp(0.4), marginBottom: hp(2) }}
      className={`relative rounded-[32px] overflow-hidden ${
        selected ? "bg-indigo-500/50" : "bg-white/10"
      }`}
    >
      <View
        style={{ paddingHorizontal: wp(6), paddingVertical: hp(3) }}
        className={`rounded-[31px] ${
          selected ? "bg-[#1e1b4b]" : "bg-[#121212]"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              style={{
                backgroundColor: selected
                  ? config.color
                  : "rgba(255,255,255,0.05)",
                width: wp(14),
                height: wp(14),
              }}
              className="rounded-2xl items-center justify-center mr-5"
            >
              <Ionicons
                name={config.icon as any}
                size={rf(3.5)}
                color={selected ? "white" : "rgba(255,255,255,0.4)"}
              />
            </View>

            <View className="flex-1">
              <Text
                style={{ fontSize: rf(2.4) }}
                className={`font-main-bold ${
                  selected ? "text-white" : "text-white/70"
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
              <Text
                style={{ fontSize: rf(1.6) }}
                className="text-white/40 mt-1 font-main-md"
                numberOfLines={1}
              >
                {config.desc}
              </Text>
            </View>
          </View>

          <View
            style={{ width: wp(6), height: wp(6) }}
            className={`rounded-full border-2 items-center justify-center ${
              selected ? "border-indigo-400 bg-indigo-400" : "border-white/20"
            }`}
          >
            {selected && (
              <Ionicons name="checkmark" size={rf(1.6)} color="white" />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default memo(DifficultyCard);