import React, { useState } from "react";
import { View, Dimensions } from "react-native";
import { router } from "expo-router";
import Animated, { 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  SharedValue
} from "react-native-reanimated";

import { hp, wp } from "@/utils/responsive";
import { optionsGameMode } from "@/constants/gamemode";
import { GameModeCard } from "./GameModeCard";
import GameModeModal from "../../modal/GameModeModal";
import { Text } from "../Text";

const { width } = Dimensions.get("window");

interface GameModeListProps {
  scrollX: SharedValue<number>;
}

const GameModeList: React.FC<GameModeListProps> = ({ scrollX }) => {
  const [selectedGame, setSelectedGame] = useState<any | null>(null);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleOpen = (item: any) => {
    if (item.id.endsWith("_online")) {
      setSelectedGame(item);
    } else {
      router.push(item.route);
    }
  };

  const handleClose = () => {
    setSelectedGame(null);
  };

  return (
    <View className="flex-1">
      <View className="flex-1">
        <Animated.FlatList
          data={optionsGameMode}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16} // Standard 60fps throttle
          snapToAlignment="center"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          removeClippedSubviews={true}
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          contentContainerStyle={{ alignItems: 'center' }}
          renderItem={({ item, index }) => (
            <View style={{ width }} className="items-center justify-center px-6">
              <GameModeCard
                item={item}
                index={index}
                onPress={() => handleOpen(item)}
                scrollX={scrollX}
              />
            </View>
          )}
        />
      </View>

      <View className="items-center pb-8 pt-4">
        <View className="mb-4 flex-row justify-center space-x-2">
            {optionsGameMode.map((_, i) => (
            <PaginationDot key={i} index={i} scrollX={scrollX} />
            ))}
        </View>
        <Text className="font-main-bold uppercase tracking-[3px] text-white/30 text-[10px]">Swipe for more modes</Text>
      </View>

      <GameModeModal
        isVisible={!!selectedGame}
        onClose={handleClose}
        gameType={selectedGame?.gameType || selectedGame?.id || ""}
      />
    </View>
  );
};

const PaginationDot = ({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) => {
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
        backgroundColor: '#6366F1'
      };
    });
  
    return <Animated.View style={style} className="h-2 rounded-full" />;
};

export default React.memo(GameModeList);
