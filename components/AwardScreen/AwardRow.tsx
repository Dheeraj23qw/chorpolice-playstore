import React, { memo, useCallback } from "react";
import { View, FlatList, ListRenderItemInfo } from "react-native";
import { Text } from "@/components/Text";
import AwardCard from "./AwardCard";

interface AwardItem {
  id: number ; 
  status: string; 
  rarity: string;
  iconName: string; 
  percent: number;
  title: string;
  desc: string;
}

interface AwardRowProps {
  title: string;
  subtitle: string;
  data: AwardItem[];
  cardWidth: number;
  getRarityStyles: (rarity: string) => string;
}

export const AwardRow = memo(
  ({ title, subtitle, data, cardWidth, getRarityStyles }: AwardRowProps) => {
    const renderItem = useCallback(
      ({ item }: ListRenderItemInfo<AwardItem>) => (
        <AwardCard
          award={item}
          cardWidth={cardWidth}
          rarityStyles={getRarityStyles(item.rarity)}
        />
      ),
      [cardWidth, getRarityStyles],
    );

    const keyExtractor = useCallback(
      (item: AwardItem) => item.id.toString(),
      [],
    );

    const getItemLayout = useCallback(
      (data: ArrayLike<AwardItem> | null | undefined, index: number) => ({
        length: cardWidth + 16,
        offset: (cardWidth + 16) * index,
        index,
      }),
      [cardWidth],
    );

    return (
      <View className="mb-10">
        <View className="mb-4 px-5">
          <Text className="text-xl font-main-bold text-white tracking-tight">
            {title}
          </Text>
          <Text className="text-xs font-main-md text-slate-500 tracking-wide uppercase mt-1">
            {subtitle}
          </Text>
        </View>

        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 16}
          decelerationRate="fast"
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          removeClippedSubviews
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          windowSize={3}
          getItemLayout={getItemLayout}
        />
      </View>
    );
  },
);
