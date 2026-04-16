import React from "react";
import { View, Image } from "react-native";
import { rf, wp } from "@/utils/responsive";
import { Text } from "../Text";

interface WinnerSectionProps {
  winnerName: string;
  winnerImage: any;
  winner: any;
}

export const WinnerSection: React.FC<WinnerSectionProps> = ({
  winnerName,
  winnerImage,
}) => {
  const imageSource =
    typeof winnerImage === "string" ? { uri: winnerImage } : winnerImage;

  return (
    <View className="items-center justify-center py-6">
      {/* 2. Layered Avatar Glass Stack */}
      <View className="mb-6 items-center justify-center">
        <View
          style={{ width: wp(45), height: wp(45) }}
          className="absolute rounded-full bg-indigo-500/10 blur-3xl"
        />

        <View
          style={{ width: wp(38), height: wp(38) }}
          className="items-center justify-center rounded-full border border-white/10 bg-white/5"
        >
          <View
            style={{ width: wp(34), height: wp(34) }}
            className="items-center justify-center overflow-hidden rounded-full border-2 border-indigo-500/50 bg-indigo-950/40"
          >
            <Image
              source={imageSource}
              style={{ width: wp(34), height: wp(34) }}
              className="opacity-90"
              resizeMode="cover"
            />
            <View
              style={{ width: wp(40), height: wp(10) }}
              className="absolute -translate-y-14 -rotate-45 bg-white/20 opacity-40"
            />
          </View>
        </View>
      </View>

      {/* 3. Winner Name with Neon Branding */}
      <View className="mb-4 items-center">
        <Text
          style={{ fontSize: rf(1.4) }}
          // Changed font-bold to font-main-bold
          className="mb-1 font-main-bold uppercase tracking-[5px] text-white/40"
        >
          Congratulations
        </Text>
        <Text
          style={{
            fontSize: rf(3.8),
            textShadowColor: "rgba(99, 102, 241, 0.6)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 20,
          }}
          // Changed font-black to font-main-bold
          className="text-center font-main-bold tracking-tighter text-white"
        >
          {winnerName.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};
