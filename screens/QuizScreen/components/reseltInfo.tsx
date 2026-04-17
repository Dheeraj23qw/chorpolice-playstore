import React, { memo } from "react";
import { View, Image, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { wp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";

interface ResultInfoProps {
  Correct: number;
  Total: number;
  Message: string;
  coinsMessage: string;
  isWinner: boolean;
  accuracy?: number;
  avatarSource: any;
}

export const ResultInfo: React.FC<ResultInfoProps> = memo(
  ({
    Correct,
    Total,
    Message,
    coinsMessage,
    isWinner,
    accuracy = 0,
    avatarSource,
  }) => {
    const { width } = useWindowDimensions();

    const themeColor = isWinner ? "#10b981" : "#ef4444";

    // 🔥 Responsive clamp (prevents huge/small extremes)
    const scale = Math.min(Math.max(width / 420, 0.85), 1.15);

    const avatarOuter = wp(60) * scale;
    const avatarRing = wp(42) * scale;
    const avatarInner = wp(38) * scale;

    return (
      <View className="mb-4 w-full items-center px-4 py-6">
        {/* HERO */}
        <View className="items-center justify-center py-6">
          {/* SOFT GLOW (reduced intensity) */}
          <View
            style={{
              width: avatarOuter,
              height: avatarOuter,
              backgroundColor: themeColor,
              opacity: 0.04, // 🔥 lighter glow
            }}
            className="absolute rounded-full"
          />

          {/* RING */}
          <View
            style={{
              width: avatarRing,
              height: avatarRing,
              borderRadius: avatarRing / 2,
              borderWidth: 1.2, // softer border
              borderColor: themeColor + "25", // lighter ring
              backgroundColor: "rgba(0,0,0,0.25)",
            }}
            className="items-center justify-center"
          >
            {/* AVATAR */}
            <View
              style={{
                width: avatarInner,
                height: avatarInner,
                borderRadius: avatarInner / 2,
                overflow: "hidden",
              }}
            >
              <Image
                source={avatarSource}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "cover",
                }}
              />
            </View>
          </View>
        </View>

        {/* SCOREBOARD */}
        <View className="mt-6 w-full flex-row items-center justify-between px-4">
          {/* SCORE */}
          <View className="flex-1">
            <Text className="mb-1 font-main-bold text-[9px] uppercase tracking-[3px] text-white/20">
              Score
            </Text>

            <View className="flex-row flex-wrap items-end">
              <Text
                className="font-main-bold text-white"
                style={{
                  fontSize: rf(4.2) * scale,
                  lineHeight: rf(4.6) * scale,
                }}
              >
                {Correct}
              </Text>

              <Text className="ml-1 font-main-bold text-[14px] text-white/10">
                /{Total}
              </Text>
            </View>
          </View>

          {/* DIVIDER */}
          <View className="mx-3 h-10 w-[1px] bg-white/10" />

          {/* ACCURACY */}
          <View className="flex-1 items-end">
            <Text className="mb-1 font-main-bold text-[9px] uppercase tracking-[3px] text-white/20">
              Accuracy
            </Text>

            <Text
              style={{
                fontSize: rf(4.2) * scale,
                lineHeight: rf(4.6) * scale,
                color: themeColor,
                textShadowColor: themeColor + "20", // 🔥 reduced glow
                textShadowRadius: 6,
              }}
              className="font-main-bold"
            >
              {accuracy}%
            </Text>
          </View>
        </View>

        {/* REWARD */}
        {!!coinsMessage && (
          <View
            className="mt-5 flex-row items-center px-5 py-3"
            style={{ width: wp(92) }}
          >
            <MaterialCommunityIcons
              name="poker-chip"
              size={rf(2.4) * scale}
              color={isWinner ? "#f59e0b" : "#6b7280"}
            />

            <View className="ml-3 flex-1">
              <Text className="font-main-bold text-[13px] uppercase tracking-[1px] text-white">
                {coinsMessage}
              </Text>
            </View>
          </View>
        )}

        {/* MESSAGE */}
        <View className="mt-7 items-center px-4 opacity-40">
          <View className="mb-3 h-[1px] w-10 bg-white/15" />

          <Text className="text-center text-[12px] italic leading-5 text-white">
            {Message}
          </Text>
        </View>
      </View>
    );
  },
);
