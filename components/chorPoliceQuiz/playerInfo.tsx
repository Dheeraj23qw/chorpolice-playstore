import React, { memo } from "react";
import { View, Image, Pressable } from "react-native";
import { wp } from "@/utils/responsive";

type PlayerInfoProps = {
  playerImage?: { type: string; src: any };
};

const getImageSource = (imageData?: { type: string; src: any }) => {
  if (!imageData) return null;
  return imageData.type === "local" ? imageData.src : { uri: imageData.src };
};

// ✅ Fix: Named the function 'PlayerInfo' inside memo to provide a Display Name
const PlayerInfo = memo(function PlayerInfo({ playerImage }: PlayerInfoProps) {
  const imageSource = getImageSource(playerImage);
  if (!imageSource) return null;

  const OUTER = wp(38);
  const INNER = wp(32);

  return (
    <View className="items-center justify-center py-6">
      {/* Subtle Ambient Halo */}
      <View
        style={{ width: OUTER * 1.2, height: OUTER * 0.35 }}
        className="absolute bottom-1 rounded-full bg-indigo-500/20 blur-2xl"
      />

      <Pressable
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <View className="items-center justify-center">
          {/* Outer Glass Ring */}
          <View
            style={{ width: OUTER, height: OUTER }}
            className="rounded-full border border-white/15 bg-white/[0.04] shadow-2xl shadow-indigo-500/30 items-center justify-center overflow-hidden"
          >
            {/* Ring Highlight */}
            <View className="absolute top-0 h-[30%] w-full bg-white/10" />

            {/* Inner Frosted Frame */}
            <View
              style={{ width: INNER, height: INNER }}
              className="rounded-full overflow-hidden border border-indigo-400/40 bg-indigo-950/40"
            >
              <Image
                source={imageSource}
                resizeMode="cover"
                style={{ width: INNER, height: INNER }}
                className="opacity-95"
              />

              {/* Curved Gloss Reflection */}
              <View
                style={{
                  width: INNER * 1.3,
                  height: INNER * 0.35,
                  borderRadius: INNER,
                }}
                className="absolute -top-3 -left-6 rotate-[-20deg] bg-white/25 opacity-30"
              />
            </View>
          </View>

          {/* Active Status Pulse Dot */}
          <View className="absolute top-2 right-2 h-4 w-4 rounded-full bg-indigo-400 border-2 border-[#0b0b0f] shadow-lg shadow-indigo-500" />
        </View>
      </Pressable>
    </View>
  );
});

// ✅ Explicitly set displayName for clarity
PlayerInfo.displayName = "PlayerInfo";

export default PlayerInfo;