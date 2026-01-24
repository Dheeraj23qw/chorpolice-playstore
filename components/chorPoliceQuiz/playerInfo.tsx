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

const PlayerInfo: React.FC<PlayerInfoProps> = memo(({ playerImage }) => {
  const imageSource = getImageSource(playerImage);

  if (!imageSource) return null;

  return (
    <View className="items-center justify-center py-6">
      {/* Metamorphism Principle: Using scale on Pressable via inline style 
         to keep tactile feedback without triggering the Interop crash.
      */}
      <Pressable 
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <View className="items-center justify-center">
          
          {/* 1. Ambient Floor Glow (Static Light Source) */}
          <View 
            style={{ 
              width: wp(40), 
              height: wp(10), 
              bottom: -5,
              transform: [{ scaleX: 1.5 }] 
            }}
            className="absolute bg-indigo-500/20 rounded-full blur-xl"
          />

          {/* 2. Outer Cyber-Ring with Glow */}
          <View 
            style={{ width: wp(36), height: wp(36) }}
            className="rounded-full border border-white/10 items-center justify-center bg-white/5 shadow-2xl shadow-indigo-500/30"
          >
            {/* 3. The Frosted Glass Container */}
            <View 
              style={{ width: wp(32), height: wp(32) }}
              className="rounded-full border-2 border-indigo-500/40 bg-indigo-950/40 items-center justify-center overflow-hidden"
            >
              <Image 
                source={imageSource} 
                style={{ width: wp(32), height: wp(32) }}
                className="opacity-90"
                resizeMode="cover"
              />
              
              {/* 4. Diagonal Glass Glare (Key Metamorphism detail) */}
              <View 
                style={{ width: wp(40), height: wp(10) }}
                className="absolute bg-white/20 -rotate-45 -translate-y-12 opacity-30"
              />
            </View>
          </View>

          {/* 5. Status Indicator (The "Active Operative" Dot) */}
          <View 
            className="absolute top-2 right-2 h-4 w-4 rounded-full bg-indigo-500 border-2 border-[#09090b] shadow-lg shadow-indigo-500" 
          />
        </View>
      </Pressable>
    </View>
  );
});

export default PlayerInfo;