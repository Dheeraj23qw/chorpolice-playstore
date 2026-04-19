import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text } from "@/components/Text";
import { ONBOARDING_SLIDES } from "../data/onboardingSlides";
import AnimatedSlideImage from "./AnimatedSlideImage";

const { width, height } = Dimensions.get("window");

const OnboardingSwiper = () => {
  const scrollX = useSharedValue(0);
  const lastIndex = ONBOARDING_SLIDES.length - 1;
  const router = useRouter();
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // 🔘 Pagination fade-out
  const paginationStyle = useAnimatedStyle(() => {
    const input = [(lastIndex - 1) * width, lastIndex * width];

    const opacity = interpolate(
      scrollX.value,
      input,
      [1, 0],
      Extrapolate.CLAMP,
    );

    return { opacity };
  });

  return (
    <View className="flex-1 bg-[#050505]">
      {/* 🌌 BACKGROUND */}
      <LinearGradient
        colors={["#000000", "#0D0D2B", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.FlatList
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        renderItem={({ item, index }) => {
          return (
            <View
              style={{ width, height }}
              className="items-center justify-center px-8"
            >
              {/* 🌈 Glow */}
              <GlowDisk index={index} scrollX={scrollX} color={item.accent} />

              {/* 🧊 Glass Card */}
              <View className="w-full overflow-hidden rounded-[40px] border border-white/10">
                <BlurView intensity={25} tint="dark" className="p-8 py-12">
                  <View className="items-center">
                    <AnimatedSlideImage
                      index={index}
                      scrollX={scrollX}
                      image={item.image}
                    />

                    <Text className="mt-10 text-center text-3xl font-black tracking-tight text-white">
                      {item.title}
                    </Text>

                    <Text className="mt-4 text-center text-base leading-6 text-white/50">
                      {item.description}
                    </Text>
                  </View>
                </BlurView>
              </View>
            </View>
          );
        }}
      />

      {/* 🚀 CTA BUTTON */}
      <AnimatedCTA
        scrollX={scrollX}
        lastIndex={lastIndex}
        onPress={() => router.replace("/mode-select")}
      />
      {/* 🔘 Pagination */}
      <Animated.View
        style={[paginationStyle]}
        className="absolute bottom-16 w-full flex-row justify-center space-x-2"
      >
        {ONBOARDING_SLIDES.map((_, i) => (
          <PaginationDot key={i} index={i} scrollX={scrollX} />
        ))}
      </Animated.View>
    </View>
  );
};

export default OnboardingSwiper;

const GlowDisk = ({ index, scrollX, color }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 0.4, 0],
      Extrapolate.CLAMP,
    );
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        animatedStyle,
        { alignItems: "center", top: height * 0.15 },
      ]}
    >
      <LinearGradient
        colors={[color, "transparent"]}
        style={{
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: 999,
        }}
      />
    </Animated.View>
  );
};

const PaginationDot = ({ index, scrollX }: any) => {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];

    const dotWidth = interpolate(
      scrollX.value,
      input,
      [8, 24, 8],
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      input,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP,
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return <Animated.View style={style} className="h-2 rounded-full bg-white" />;
};

const AnimatedCTA = ({ scrollX, lastIndex }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const input = [(lastIndex - 1) * width, lastIndex * width];

    const opacity = interpolate(
      scrollX.value,
      input,
      [0, 1],
      Extrapolate.CLAMP,
    );

    const translateY = interpolate(
      scrollX.value,
      input,
      [60, 0],
      Extrapolate.CLAMP,
    );

    const scale = interpolate(
      scrollX.value,
      input,
      [0.85, 1],
      Extrapolate.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: 60,
          width: "100%",
          alignItems: "center",
        },
      ]}
    >
      <View className="overflow-hidden rounded-full">
        <LinearGradient
          colors={["#A78BFA", "#60A5FA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-full px-12 py-4"
        >
          <Text className="text-lg font-bold tracking-wide text-white">
            Let's Get Started
          </Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};
