import React from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MotiView, AnimatePresence } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  type SharedValue,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { rf, wp } from "@/utils/responsive";
import { ONBOARDING_SLIDES } from "../data/onboardingSlides";
import AnimatedSlideImage from "./AnimatedSlideImage";

const { width, height } = Dimensions.get("window");

interface OnboardingSwiperProps {
  onComplete: () => void;
}

const OnboardingSwiper = ({ onComplete }: OnboardingSwiperProps) => {
  const scrollX = useSharedValue(0);
  const lastIndex = ONBOARDING_SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

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

  const [isCompleting, setIsCompleting] = React.useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = React.useState(0);

  const loadingMessages = [
    "Preparing your experience...",
    "Initializing game engines...",
    "Syncing player profile...",
    "Opening the world...",
  ];

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCompleting) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isCompleting]);

  const handlePress = React.useCallback(() => {
    if (isCompleting) return;
    setIsCompleting(true);
    onComplete();
  }, [isCompleting, onComplete]);

  return (
    <View className="flex-1 bg-[#050505]">
      <LinearGradient
        colors={["#000000", "#0D0D2B", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.FlatList
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={!isCompleting} // Disable scrolling when loading
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
              <GlowDisk index={index} scrollX={scrollX} color={item.accent} />

              <View className="w-full overflow-hidden rounded-[40px] border border-white/10">
                <BlurView intensity={25} tint="dark" className="p-8 py-12">
                  <View className="items-center">
                    <AnimatedSlideImage
                      index={index}
                      scrollX={scrollX}
                      image={item.image}
                    />

                    <Text className="mt-10 text-center font-main-bold text-3xl tracking-tight text-white">
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

      <AnimatedCTA
        scrollX={scrollX}
        lastIndex={lastIndex}
        onPress={handlePress}
        isLoading={isCompleting}
        loadingMessage={loadingMessages[loadingMessageIndex]}
      />

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

const AnimatedCTA = ({
  scrollX,
  lastIndex,
  onPress,
  isLoading = false,
  loadingMessage = "Starting...",
}: {
  scrollX: SharedValue<number>;
  lastIndex: number;
  onPress: () => void;
  isLoading?: boolean;
  loadingMessage?: string;
}) => {
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
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        disabled={isLoading}
      >
        <MotiView
          animate={{
            scale: isLoading ? [1, 1.02, 1] : 1,
          }}
          transition={{
            type: "timing",
            duration: 1200,
            loop: isLoading,
          }}
          className="overflow-hidden rounded-full"
        >
          <LinearGradient
            colors={isLoading ? ["#374151", "#1F2937"] : ["#A78BFA", "#60A5FA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="items-center justify-center rounded-full px-10 py-5"
          >
            {isLoading && (
              <ActivityIndicator
                color="white"
                size="small"
                style={{ marginBottom: 8 }}
              />
            )}

            <View
              style={{
                minWidth: wp(58),
                minHeight: rf(3),
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnimatePresence exitBeforeEnter>
                <MotiView
                  key={isLoading ? loadingMessage : "start"}
                  from={{ opacity: 0, translateY: 16 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -16 }}
                  transition={{
                    type: "timing",
                    duration: 420,
                  }}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: rf(1.8),
                      textAlign: "center",
                    }}
                    className="font-main-bold uppercase tracking-[2px] text-white"
                    numberOfLines={2}
                  >
                    {isLoading ? loadingMessage : "Let's Get Started"}
                  </Text>
                </MotiView>
              </AnimatePresence>
            </View>
          </LinearGradient>
        </MotiView>
      </TouchableOpacity>
    </Animated.View>
  );
};
