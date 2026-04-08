import React, { memo } from "react";
import { View, Image, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";

interface ResultInfoProps {
  Correct: number;
  Total: number;
  Message: string;
  coinsMessage: string;
  isWinner: boolean;
  accuracy?: number;
  bonus?: number;
}

const CHARACTER_IMAGES = {
  king: require("@/assets/images/chorsipahi/king.png"),
  thief: require("@/assets/images/chorsipahi/thief.png"),
};

export const ResultInfo: React.FC<ResultInfoProps> = memo(
  ({
    Correct,
    Total,
    Message,
    coinsMessage,
    isWinner,
    accuracy = 0,
    bonus = 0,
  }) => {
    const themeColor = isWinner ? "#10b981" : "#ef4444";
    const heroImage = isWinner ? CHARACTER_IMAGES.king : CHARACTER_IMAGES.thief;

    return (
      <View className="w-full items-center py-6">
        {/* --- HERO SECTION: CHARACTER SPOTLIGHT --- */}
        <View className="items-center justify-center py-8">
          {/* External Ambient Halo */}
          <View
            style={{
              width: wp(70),
              height: wp(70),
              backgroundColor: themeColor,
            }}
            className="absolute rounded-full opacity-[0.05] blur-[100px]"
          />

          {/* Core Glow */}
          <View
            style={{
              width: wp(40),
              height: wp(40),
              backgroundColor: themeColor,
            }}
            className="absolute rounded-full opacity-[0.15] blur-[40px]"
          />

          <Image
            source={heroImage}
            style={{
              width: wp(50),
              height: wp(50),
              resizeMode: "contain",
              transform: [{ translateY: -10 }],
            }}
          />
        </View>

        {/* --- SCOREBOARD: HIGH-CONTRAST DATA --- */}
        <View className="mb-12 w-full flex-row items-center justify-between px-10">
          <View>
            <Text className="mb-1 font-main-bold text-[10px] uppercase tracking-[4px] text-white/20">
              Score
            </Text>
            <View className="flex-row items-baseline">
              <Text className="font-main-bold text-[48px] leading-[52px] text-white">
                {Correct}
              </Text>
              <Text className="ml-1 font-main-bold text-[18px] text-white/10">
                /{Total}
              </Text>
            </View>
          </View>

          {/* Vertical Kinetic Divider */}
          <View className="h-14 w-[2px] overflow-hidden rounded-full bg-white/5">
            <View
              style={{ backgroundColor: themeColor }}
              className="absolute top-0 h-1/2 w-full shadow-lg"
            />
          </View>

          <View className="items-end">
            <Text className="mb-1 font-main-bold text-[10px] uppercase tracking-[4px] text-white/20">
              Accuracy
            </Text>
            <Text
              className="font-main-bold text-[48px] leading-[52px]"
              style={{
                color: themeColor,
                textShadowColor: themeColor + "44",
                textShadowRadius: 15,
              }}
            >
              {accuracy}%
            </Text>
          </View>
        </View>

        {/* --- THE REWARD TICKET: UNBOUNDED & CLEAN --- */}
        {!!coinsMessage && (
          <View
            className="flex-row items-center justify-between px-8 py-4"
            style={{ width: wp(95) }}
          >
            {/* Left Side: Coin Info */}
            <View className="flex-1 flex-row items-center">
              <MaterialCommunityIcons
                name="poker-chip"
                size={rf(3)}
                color={isWinner ? "#f59e0b" : "#4b5563"}
                style={{
                  textShadowColor: isWinner
                    ? "rgba(245, 158, 11, 0.5)"
                    : "transparent",
                  textShadowRadius: 12,
                }}
              />
              <View className="ml-5 flex-1">
                <Text
                  numberOfLines={1}
                  className="font-main-bold text-[18px] uppercase tracking-[1px] text-white"
                >
                  {coinsMessage}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* --- MINIMALIST FOOTER MESSAGE --- */}
        <View className="mt-8 items-center opacity-40">
          <View className="mb-4 h-[1px] w-12 bg-white/20" />
          <Text className="font-main-medium px-10 text-center text-[13px] italic leading-5 text-white">
            {Message}
          </Text>
        </View>
      </View>
    );
  },
);
