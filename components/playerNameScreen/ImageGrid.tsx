import React, { memo, useEffect } from "react";
import { View, Image, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { GameMode } from "@/types/redux/reducers";
import { wp, hp, rf } from "@/utils/responsive";
import { Text } from "../Text";

import { MotiView, AnimatePresence } from "moti";

interface ImageGridProps {
  selectedImages: number[];
  handleImageSelect: (imageId: number, gameMode: GameMode) => void;
  gameMode?: GameMode;
  isTaken: (id: number) => boolean;
}

const CARD_WIDTH = wp(60);
const SPACER = (wp(100) - CARD_WIDTH) / 2;

const ImageGridComponent: React.FC<ImageGridProps> = ({
  selectedImages,
  handleImageSelect,
  gameMode = "OFFLINE",
  isTaken,
}) => {
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images,
  );

  const scrollX = useSharedValue(0);
  const arrowTranslateX = useSharedValue(0);

  const imagesArray = Object.entries(playerImages).map(([key, image]) => ({
    id: Number(key),
    image: image.type === "local" ? image.src : { uri: image.src },
  }));

  useEffect(() => {
    arrowTranslateX.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 700 }),
        withTiming(0, { duration: 700 }),
      ),
      -1,
      true,
    );
  }, []);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowTranslateX.value }],
    opacity: interpolate(scrollX.value, [0, 40], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View className="py-6">
      {/* SWIPE HINT */}
      <Animated.View
        style={arrowStyle}
        className="mb-4 flex-row items-center self-center"
      >
        <Text
          className="mr-2 font-main-bold text-white/40"
          style={{ fontSize: rf(1.2) }}
        >
          SWIPE TO EXPLORE
        </Text>
        <Ionicons
          name="arrow-forward"
          size={rf(1.5)}
          color="rgba(255,255,255,0.3)"
        />
      </Animated.View>

      <Animated.FlatList
        data={imagesArray}
        horizontal
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACER }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <AvatarCard
            item={item}
            index={index}
            scrollX={scrollX}
            isSelected={selectedImages.includes(item.id)}
            isTaken={isTaken?.(item.id) || false}
            onPress={() => handleImageSelect(item.id, gameMode)}
          />
        )}
      />
    </View>
  );
};

/* ================= CARD ================= */

const AvatarCard = ({
  item,
  index,
  scrollX,
  isSelected,
  isTaken,
  onPress,
}: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + 20),
      index * (CARD_WIDTH + 20),
      (index + 1) * (CARD_WIDTH + 20),
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolation.CLAMP,
    );

    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [12, 0, -12],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { rotateY: `${rotateY}deg` }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [
        (index - 1) * (CARD_WIDTH + 20),
        index * (CARD_WIDTH + 20),
        (index + 1) * (CARD_WIDTH + 20),
      ],
      [0, 0.6, 0],
      Extrapolation.CLAMP,
    );

    return { opacity };
  });

  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: hp(42),
        marginHorizontal: 10,
        justifyContent: "center",
      }}
    >
      {/* GLOW */}
      <Animated.View
        style={[
          glowStyle,
          {
            position: "absolute",
            width: CARD_WIDTH * 0.9,
            height: CARD_WIDTH * 0.9,
            borderRadius: CARD_WIDTH,
            backgroundColor: "#7C5CFF",
            alignSelf: "center",
          },
        ]}
      />

      <Animated.View
        style={[
          animatedStyle,
          {
            width: CARD_WIDTH,
            height: hp(38),
            borderRadius: 32,
            overflow: "hidden",
            borderWidth: isSelected ? 3 : 1,
            borderColor: isSelected ? "#7C5CFF" : "rgba(255,255,255,0.12)",
            backgroundColor: "#111",
            opacity: isTaken ? 0.7 : 1,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            if (isTaken) return;
            onPress();
          }}
          className="flex-1"
        >
          {/* MAIN IMAGE */}
          <Image
            source={item.image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />

          {/* DARK OVERLAY (taken effect) */}
          {isTaken && <View className="absolute inset-0 bg-black/70" />}

          {/* SUBTLE GRAYSCALE LAYER */}
          {isTaken && <View className="absolute inset-0 bg-white/5" />}

          {/* SELECTED GLOW */}
          {isSelected && !isTaken && (
            <View className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-purple-600">
              <Ionicons name="checkmark-circle" size={22} color="white" />
            </View>
          )}

          {/* 🔥 FULL SCREEN "TAKEN" POSTER */}
          <AnimatePresence>
            {isTaken && (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: "timing",
                  duration: 250,
                }}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              >
                <View className="items-center justify-center">
                {/* BIG CENTER STAMP */}
                <View className="items-center">
                  <View className="rounded-2xl bg-black/60 px-5 py-2">
                    <Text className="font-main-bold text-sm tracking-[3px] text-white">
                      ALREADY TAKEN
                    </Text>
                  </View>

                  <Text className="mt-2 text-xs text-white/60">
                    Choose another avatar
                  </Text>
                </View>
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </Pressable>
      </Animated.View>
    </View>
  );
};
export const ImageGrid = memo(ImageGridComponent);
