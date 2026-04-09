import React, { memo, useEffect } from "react";
import { View, Image, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
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

interface ImageGridProps {
  selectedImages: number[];
  handleImageSelect: (imageId: number, gameMode: GameMode) => void;
  gameMode?: GameMode;
}

const CARD_WIDTH = wp(60); // Sized down for better "Deck" feel
const SPACER = (wp(100) - CARD_WIDTH) / 2;

const ImageGridComponent: React.FC<ImageGridProps> = ({
  selectedImages,
  handleImageSelect,
  gameMode = "OFFLINE",
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

  // Floating Arrow Animation
  useEffect(() => {
    arrowTranslateX.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 800 }),
        withTiming(0, { duration: 800 }),
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
    opacity: interpolate(scrollX.value, [0, 50], [1, 0], Extrapolate.CLAMP),
  }));

  return (
    <View className="py-6">
      {/* ↔️ SWIPE HINT */}
      <Animated.View
        style={arrowStyle}
        className="mb-4 flex-row items-center self-center"
      >
        <Text
          className="mr-2 font-main-bold text-white/40"
          style={{ fontSize: rf(1.2), letterSpacing: 2 }}
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
            onPress={() => handleImageSelect(item.id, gameMode)}
          />
        )}
      />
    </View>
  );
};

// ... existing imports

const AvatarCard = ({ item, index, scrollX, isSelected, onPress }: any) => {
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
      Extrapolate.CLAMP,
    );

    // Smooth opacity for the glow: only the center card should glow intensely
    const glowOpacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 0.35, 0],
      Extrapolate.CLAMP,
    );

    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [15, 0, -15],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ scale }, { rotateY: `${rotateY}deg` }],
      glowOpacity, // passing to use in the glow view
    };
  });

  // Separate style for the glow underlay
  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [
        (index - 1) * (CARD_WIDTH + 20),
        index * (CARD_WIDTH + 20),
        (index + 1) * (CARD_WIDTH + 20),
      ],
      [0, 0.6, 0], // Peak glow at 60% opacity when centered
      Extrapolate.CLAMP,
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
      {/* 🟣 THE DEEP GLOW UNDERLAY (Matching UserProfileCard) */}
      <Animated.View
        style={[
          glowStyle,
          {
            position: "absolute",
            width: CARD_WIDTH * 0.8,
            height: CARD_WIDTH * 0.8,
            borderRadius: CARD_WIDTH,
            backgroundColor: "#7C5CFF",
            alignSelf: "center",
            filter: [{ blur: 40 }], // Blur for the neon light bleed effect
          },
        ]}
      />

      <Animated.View
        style={[
          animatedStyle,
          {
            width: CARD_WIDTH,
            height: hp(38),
            borderRadius: 32, // Increased for a smoother "premium" feel
            borderWidth: isSelected ? 4 : 1.5,
            // Dynamic border color
            borderColor: isSelected ? "#7C5CFF" : "rgba(255,255,255,0.15)",
            backgroundColor: "#151515",
            overflow: "hidden",
            // Depth Shadow
            shadowColor: isSelected ? "#7C5CFF" : "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isSelected ? 0.5 : 0.3,
            shadowRadius: 15,
            elevation: 10,
          },
        ]}
      >
        <Pressable onPress={onPress} className="flex-1">
          <Image
            source={item.image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />

          {/* 🧊 GLASS SHINE (Matching the gloss top edge) */}
          <View
            className="absolute top-0 h-[1px] w-full bg-white/20"
            style={{ marginTop: 2, marginHorizontal: 20, width: "80%" }}
          />
          <View className="absolute top-0 h-1/4 w-full bg-white/5" />

          {/* SELECTED BADGE (Enhanced) */}
          {isSelected && (
            <View
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
              className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-purple-600"
            >
              <Ionicons name="checkmark-circle" size={rf(2.5)} color="white" />
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};

export const ImageGrid = memo(ImageGridComponent);
