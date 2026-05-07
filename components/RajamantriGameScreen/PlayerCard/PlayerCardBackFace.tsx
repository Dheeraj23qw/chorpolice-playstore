import React, { memo } from "react";
import { Image, View } from "react-native";

import { Text } from "../../Text";
import { roleImages } from "./cardAssets";

interface PlayerCardBackFaceProps {
  role: string;
  playerName: string;
  clicked: boolean;
  isCorrect: boolean;
}

const PlayerCardBackFaceComponent: React.FC<PlayerCardBackFaceProps> = ({
  role,
  playerName,
  clicked,
  isCorrect,
}) => {
  return (
    <View className="flex-1 items-center justify-center p-3">
      <View className="absolute inset-0 rounded-[26px] bg-indigo-500/10" />

      <View className="absolute top-3 z-10 w-full items-center">
        <View className="rounded-full border border-indigo-400/30 bg-indigo-950/80 px-3 py-1 shadow-lg">
          <Text
            numberOfLines={1}
            className="font-main-bold text-[9px] uppercase tracking-widest text-indigo-200"
          >
            {playerName}
          </Text>
        </View>
      </View>

      {clicked && (
        <View
          className={`absolute inset-0 z-0 rounded-[26px] border-4 ${
            isCorrect
              ? "border-green-500/60 bg-green-500/20"
              : "border-red-500/60 bg-red-500/20"
          }`}
        />
      )}

      <Image
        source={roleImages[role]}
        className="z-10 h-full w-full"
        resizeMode="contain"
      />

      <View className="absolute bottom-3 z-10 rounded-full border border-indigo-400/40 bg-indigo-950/90 px-4 py-1.5 shadow-lg">
        <Text className="font-main-bold text-[11px] uppercase tracking-[2px] text-indigo-100">
          {role}
        </Text>

        <View className="absolute inset-x-2 top-0 h-[1px] rounded-full bg-white/40" />
      </View>
    </View>
  );
};

export const PlayerCardBackFace = memo(PlayerCardBackFaceComponent);
