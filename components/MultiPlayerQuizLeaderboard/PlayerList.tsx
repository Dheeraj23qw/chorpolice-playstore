import React from "react";
import { ScrollView, View } from "react-native";
import Animated, { Layout, FadeInDown, FadeOut } from "react-native-reanimated";
import { PlayerRow } from "./PlayerRow";

export const PlayerList = ({
  players,
  round,
  expandedId,
  toggleExpand,
  allFinished,
  localPlayerId,
}: any) => {
  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16, // 🔽 reduced (less "boxed")
          paddingTop: 12,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {players.map((item: any, index: number) => (
          <Animated.View
            key={item.id}
            layout={Layout.springify().damping(18).stiffness(140)}
            entering={FadeInDown.delay(index * 40)}
            exiting={FadeOut}
          >
            <PlayerRow
              item={item}
              index={index}
              round={round}
              expanded={expandedId === item.id}
              toggleExpand={toggleExpand}
              allFinished={allFinished}
              isMe={item.id === localPlayerId}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};
