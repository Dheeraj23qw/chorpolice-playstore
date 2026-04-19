import React, { useState } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { ONBOARDING_SLIDES } from "../data/onboardingSlides";
import AnimatedSlideImage from "./AnimatedSlideImage";

const { width } = Dimensions.get("window");

const OnboardingSwiper = () => {
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View className="flex-1 bg-black">
      {/* 🌌 GLOBAL BACKGROUND GRADIENT (AAA LAYER 1) */}
      <LinearGradient
        colors={["#000000", "#0B0B1A", "#000000"]}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />

      {/* 🌫️ VIGNETTE OVERLAY (AAA DEPTH LAYER) */}
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      />

      <Animated.FlatList
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <View
            style={{ width }}
            className="flex-1 items-center justify-center px-6"
          >
            {/* 🌈 GLOW + BLUR COMBO (AAA CORE EFFECT) */}
            <View className="absolute top-28">
              <LinearGradient
                colors={[item.accent + "80", "transparent"]}
                style={{
                  width: 260,
                  height: 260,
                  borderRadius: 999,
                  position: "absolute",
                }}
              />

              <BlurView
                intensity={80}
                tint="dark"
                style={{
                  width: 260,
                  height: 260,
                  borderRadius: 999,
                  opacity: 0.6,
                }}
              />
            </View>

            {/* 🧊 GLASS CARD BACKDROP (TEXT AREA) */}
            <BlurView
              intensity={35}
              tint="dark"
              style={{
                padding: 20,
                borderRadius: 24,
                overflow: "hidden",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              {/* Image */}
              <AnimatedSlideImage
                index={index}
                scrollX={scrollX}
                image={item.image}
              />

              {/* Title */}
              <Text className="mt-6 text-center text-2xl font-bold text-white">
                {item.title}
              </Text>

              {/* Description */}
              <Text className="mt-3 text-center text-sm text-white/70">
                {item.description}
              </Text>
            </BlurView>
          </View>
        )}
      />

      {/* 🔘 DOTS (clean + modern) */}
      <View className="absolute bottom-20 w-full flex-row justify-center">
        {ONBOARDING_SLIDES.map((_, i) => (
          <View
            key={i}
            className={`mx-1 h-2 w-2 rounded-full ${
              i === activeIndex ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default OnboardingSwiper;
