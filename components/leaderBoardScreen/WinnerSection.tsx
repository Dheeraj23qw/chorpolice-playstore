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
      {/* 1. The Crown / Status Tag */}
      <View className="bg-amber-500/20 border border-amber-500/40 px-4 py-1 rounded-full mb-6 flex-row items-center">
        <Text className="mr-2">🏆</Text>
        <Text
          style={{ fontSize: rf(1.2) }}
          // Changed font-black to font-main-bold
          className="text-amber-400 font-main-bold uppercase tracking-[3px]"
        >
          Top Operative
        </Text>
      </View>

      {/* 2. Layered Avatar Glass Stack */}
      <View className="items-center justify-center mb-6">
        <View
          style={{ width: wp(45), height: wp(45) }}
          className="absolute bg-indigo-500/10 rounded-full blur-3xl"
        />

        <View
          style={{ width: wp(38), height: wp(38) }}
          className="rounded-full border border-white/10 items-center justify-center bg-white/5"
        >
          <View
            style={{ width: wp(34), height: wp(34) }}
            className="rounded-full border-2 border-indigo-500/50 bg-indigo-950/40 items-center justify-center overflow-hidden"
          >
            <Image
              source={imageSource}
              style={{ width: wp(34), height: wp(34) }}
              className="opacity-90"
              resizeMode="cover"
            />
            <View
              style={{ width: wp(40), height: wp(10) }}
              className="absolute bg-white/20 -rotate-45 -translate-y-14 opacity-40"
            />
          </View>
        </View>
      </View>

      {/* 3. Winner Name with Neon Branding */}
      <View className="items-center mb-4">
        <Text
          style={{ fontSize: rf(1.4) }}
          // Changed font-bold to font-main-bold
          className="text-white/40 font-main-bold tracking-[5px] uppercase mb-1"
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
          className="text-white font-main-bold  tracking-tighter text-center"
        >
          {winnerName.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};
