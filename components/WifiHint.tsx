import React from "react";
import { View, Image, useWindowDimensions } from "react-native";
import { MotiView } from "moti";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

const WifiHint = () => {
  const { width } = useWindowDimensions();

  // 🔥 Responsive sizing
  const imageSize = Math.min(width * 0.18, 80); // max 80
  const glowSize = imageSize * 1.1;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      className="mb-6 flex-row items-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4"
    >
      {/* 🔮 Responsive Glow */}
      <View
        style={{
          width: glowSize,
          height: glowSize,
        }}
        className="absolute left-3 rounded-full bg-purple-500/20 blur-2xl"
      />

      {/* 🕺 Floating Character (Moti) */}
      <MotiView
        from={{ translateY: 0 }}
        animate={{ translateY: -10 }}
        transition={{
          type: "timing",
          duration: 1200,
          loop: true,
          repeatReverse: true,
        }}
        style={{ marginRight: 12 }}
      >
        <Image
          source={require("@/assets/images/chorsipahi/thief.webp")}
          style={{
            width: imageSize,
            height: imageSize,
          }}
          resizeMode="contain"
        />
      </MotiView>

      {/* 📶 Text Content */}
      <View className="flex-1">
        <Text
          style={{ fontSize: rf(1.8) }}
          className="mb-1 font-main-bold text-white"
        >
          Play with Friends
        </Text>

        {/* Instructions */}
        <Text style={{ fontSize: rf(1.5) }} className="leading-5 text-white/70">
          1. Connect everyone to the{" "}
          <Text className="text-purple-300">same WiFi or Hotspot 📶</Text>
          {"\n"}
          2. One player taps <Text className="text-green-300">Host Game</Text>
          {"\n"}
          3. Others tap <Text className="text-blue-300">Join Game</Text>
          {"\n"}
          4. No friends?{" "}
          <Text className="text-yellow-300">Just tap Host Game 😉</Text>
        </Text>

        {/* Warning */}
        <Text style={{ fontSize: rf(1.2) }} className="mt-2 text-red-400/70">
          Won’t work on mobile data or different WiFi
        </Text>
      </View>
    </MotiView>
  );
};

export default React.memo(WifiHint);
